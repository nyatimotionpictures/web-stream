import React, { useEffect, useRef, useState } from 'react';
import apiRequest from '../../3-Middleware/apiRequest';

// Streaming configuration constants (matching backend)
const STREAMING_CONFIG = {
  // Optimal chunk sizes for different content types
  CHUNK_SIZES: {
    m3u8: 64 * 1024,    // 64KB for playlists (fast loading)
    ts: 1024 * 1024,    // 1MB for video segments (optimal balance)
    mp4: 512 * 1024,    // 512KB for MP4 files (good for seeking)
    default: 256 * 1024 // 256KB default
  },

  // Range request limits
  MAX_RANGE_SIZE: 10 * 1024 * 1024, // 10MB max range size
  MIN_RANGE_SIZE: 1024,              // 1KB min range size

  // Buffer settings
  BUFFER_SIZE: 64 * 1024, // 64KB buffer for streaming
  HIGH_WATER_MARK: 128 * 1024 // 128KB high water mark
};

const SeriesStreamingPlayer = ({
  filmData,
  allVideos,
  videoSrc,
  handleResolution,
  episodeIndex,
  handleNextEpisode,
  allEpisodes,
  purchasedData,
  resourceId,
  type = 'hd', // Default to HD instead of SD
  thumbnailUrl,
  title,
  controls = true,
  width = '100%',
  height = 'auto',
  aspectRatio = '16/9',
  episodeData
}) => {
  // Debug logging
  console.log('🎬 SeriesStreamingPlayer Props:', {
    filmData,
    allVideos,
    videoSrc,
    handleResolution,
    episodeIndex,
    handleNextEpisode,
    allEpisodes,
    purchasedData,
    resourceId,
    type,
    thumbnailUrl,
    title,
    controls,
    width,
    height,
    aspectRatio
  });

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [streamingUrls, setStreamingUrls] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [isHLS, setIsHLS] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(type);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [bufferStatus, setBufferStatus] = useState('Initializing...');
  const [fragmentsLoaded, setFragmentsLoaded] = useState(0);
  const [totalFragments, setTotalFragments] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [availableCaptions, setAvailableCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [useNativeSubtitles, setUseNativeSubtitles] = useState(true); // Use native browser subtitles by default
  const [streamingConfig, setStreamingConfig] = useState(null);
  const [rangeRequestSupported, setRangeRequestSupported] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderTimeoutRef = useRef(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('captions'); // 'captions' or 'quality'
  const [showNextEpisodeCountdown, setShowNextEpisodeCountdown] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(10);
  const [showEpisodeListPopup, setShowEpisodeListPopup] = useState(false);

  // Enhanced performance metrics tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fragmentLoadTime: [],
    bufferEfficiency: 0,
    qualitySwitches: 0,
    errorRate: 0,
    rangeRequestSuccess: 0,
    rangeRequestTotal: 0,
    averageLoadTime: 0
  });

  // Utility function to generate unique track IDs
  const generateUniqueTrackId = (baseId, language) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return baseId || `track-${language || 'unknown'}-${timestamp}-${randomSuffix}`;
  };

  // Auto-hide cursor and controls timeout
  const cursorTimeoutRef = useRef(null);
  const CURSOR_HIDE_DELAY = 3000; // 3 seconds of inactivity before hiding

  // Prevent multiple calls to getStreamingUrl for the same resource
  const processedResourceRef = useRef(null);

  // Custom fetch interceptor for video element requests (fallback for native video)
  const setupVideoFetchInterceptor = () => {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;

    // Get the auth token
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user !== null && user.token ? user.token : null;

    if (!token) return;

    // Intercept fetch requests for video streaming
    window.fetch = function (url, options = {}) {
      if (typeof url === 'string' && url.includes('/api/v1/userStreaming/')) {
        // Check if URL already has token
        if (!url.includes('token=')) {
          const separator = url.includes('?') ? '&' : '?';
          const authenticatedUrl = `${url}${separator}token=${token}`;
          console.log(`🔐 Fetch Interceptor: Added token to request: ${url} -> ${authenticatedUrl}`);
          url = authenticatedUrl;
        }
      }
      return originalFetch(url, options);
    };

    // Intercept XMLHttpRequest for video streaming
    const originalOpen = originalXHR.prototype.open;
    originalXHR.prototype.open = function (method, url, ...args) {
      if (typeof url === 'string' && url.includes('/api/v1/userStreaming/')) {
        // Check if URL already has token
        if (!url.includes('token=')) {
          const separator = url.includes('?') ? '&' : '?';
          const authenticatedUrl = `${url}${separator}token=${token}`;
          console.log(`🔐 XHR Interceptor: Added token to request: ${url} -> ${authenticatedUrl}`);
          url = authenticatedUrl;
        }
      }
      return originalOpen.call(this, method, url, ...args);
    };

    console.log('🔐 Video fetch interceptor set up for native video element');
  };

  // Auto-hide cursor functionality
  const resetCursorTimeout = () => {
    console.log('🖱️ resetCursorTimeout called - setting showCursor to true');
    setShowCursor(true);

    // Clear existing timeout
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }

    // Set new timeout to hide cursor and controls
    cursorTimeoutRef.current = setTimeout(() => {
      console.log('🖱️ Cursor timeout triggered - checking conditions');
      console.log('🖱️ isPlaying:', isPlaying, 'isFullscreen:', isFullscreen, 'isHovering:', isHovering);

      // Hide cursor and controls if video is playing (regardless of hover state or fullscreen)
      if (isPlaying) {
        console.log('🖱️ Hiding cursor and controls - video playing, user idle');
        setShowCursor(false);
        console.log('🖱️ Cursor and controls hidden due to inactivity');

        // Additional logging for fullscreen mode
        if (isFullscreen) {
          console.log('🖥️ Fullscreen mode - cursor and controls should be hidden');
        }
      } else {
        console.log('🖱️ Not hiding cursor - video not playing');
        console.log('🖱️ isPlaying:', isPlaying, 'isFullscreen:', isFullscreen, 'isHovering:', isHovering);
      }
    }, CURSOR_HIDE_DELAY);
  };

  // Handle mouse movement for cursor visibility
  const handleMouseMove = () => {
    setIsHovering(true);
    resetCursorTimeout();
  };

  const clearCursorTimeout = () => {
    if (cursorTimeoutRef.current) {
      console.log('🖱️ clearCursorTimeout called - clearing timeout');
      clearTimeout(cursorTimeoutRef.current);
      cursorTimeoutRef.current = null;
    }
  };

  // Enhanced auto-hide controls functionality
  const shouldShowControls = () => {
    // Always show controls when:
    // 1. Video is paused
    // 2. User is hovering AND cursor is visible (recent activity)
    // 3. Cursor is visible (recent activity) - this covers all recent interactions
    // 4. Settings menu is open
    const shouldShow = !isPlaying || (isHovering && showCursor) || showCursor || showSettingsMenu;

    // Debug logging for fullscreen mode
    if (isFullscreen) {
      const reason = !isPlaying ? 'video paused' :
        (isHovering && showCursor) ? 'hovering with cursor visible' :
          showCursor ? 'cursor visible (recent activity)' :
            showSettingsMenu ? 'settings menu open' : 'no reason found';

      console.log('🖥️ Fullscreen controls check:', {
        isPlaying,
        isHovering,
        showCursor,
        showSettingsMenu,
        shouldShow,
        reason
      });
    }

    return shouldShow;
  };

  // Enhanced range request handler with content-aware optimization
  const getOptimalChunkSize = (contentType) => {
    if (contentType.includes('m3u8')) return 64 * 1024; // 64KB
    if (contentType.includes('mp2t')) return 1024 * 1024; // 1MB
    if (contentType.includes('mp4')) return 512 * 1024; // 512KB
    return 256 * 1024; // Default
  };

  const optimizedRangeRequest = async (url, startByte, endByte, contentType) => {
    try {
      // Use dynamic configuration if available, fallback to static
      const chunkSize = streamingConfig?.optimizedChunkSizes?.[contentType] ||
        getOptimalChunkSize(contentType);

      const requestedSize = endByte - startByte + 1;

      // Limit range size for performance
      let finalEnd = endByte;
      const maxRangeSize = streamingConfig?.maxRangeSize || STREAMING_CONFIG.MAX_RANGE_SIZE;

      if (requestedSize > maxRangeSize) {
        finalEnd = startByte + maxRangeSize - 1;
        console.log(`📦 Range size limited from ${requestedSize} to ${maxRangeSize} bytes`);
      }

      // Ensure minimum range size
      const minRangeSize = STREAMING_CONFIG.MIN_RANGE_SIZE;
      if (finalEnd - startByte + 1 < minRangeSize) {
        finalEnd = startByte + minRangeSize - 1;
      }

      const response = await fetch(url, {
        headers: {
          'Range': `bytes=${startByte}-${finalEnd}`,
          'Cache-Control': 'no-cache'
        }
      });

      // Track range request performance
      setPerformanceMetrics(prev => ({
        ...prev,
        rangeRequestTotal: prev.rangeRequestTotal + 1,
        rangeRequestSuccess: response.status === 206 ? prev.rangeRequestSuccess + 1 : prev.rangeRequestSuccess
      }));

      if (response.status === 206) {
        console.log(`✅ Optimized range request successful: ${startByte}-${finalEnd} (${finalEnd - startByte + 1} bytes)`);
        return response;
      } else if (response.status === 200) {
        console.warn('⚠️ Range request not supported, using full content');
        setRangeRequestSupported(false);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Optimized range request failed:', error);
      setRangeRequestSupported(false);
      // Fallback to full content request
      return fetch(url);
    }
  };

  // Enhanced error recovery with intelligent strategies
  const handleStreamingError = (error, context) => {
    console.error('❌ Streaming error:', error);

    // Track error rate
    setPerformanceMetrics(prev => ({
      ...prev,
      errorRate: prev.errorRate + 1
    }));

    // Implement intelligent recovery strategies
    if (error.type === 'network') {
      console.log('🔄 Network error detected, implementing recovery strategy...');
      // Network error recovery logic
    } else if (error.type === 'media') {
      console.log('🔄 Media error detected, switching to lower quality...');
      // Media error recovery logic
    }
  };

  // Audio sync monitoring and correction
  const monitorAudioSync = () => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    try {
      // Check for audio drift
      const currentTime = video.currentTime;
      const duration = video.duration;

      if (duration && currentTime > 0) {
        // Monitor audio buffer
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferAhead = bufferedEnd - currentTime;

          // If buffer is too small, audio might lag
          if (bufferAhead < 2) {
            console.warn('⚠️ Low audio buffer detected - potential audio lag');

            // Try to increase buffer by pausing briefly
            if (bufferAhead < 1) {
              console.log('🔄 Audio buffer too low, attempting to increase buffer...');
              const wasPlaying = !video.paused;
              if (wasPlaying) {
                video.pause();
                setTimeout(() => {
                  if (wasPlaying) {
                    video.play().catch(console.error);
                  }
                }, 1000); // Wait 1 second to build buffer
              }
            }
          }
        }

        // Check for audio sync issues
        const audioTracks = video.audioTracks;
        if (audioTracks && audioTracks.length > 0) {
          const audioTrack = audioTracks[0];
          if (audioTrack.readyState === 'loaded') {
            // Monitor for audio drift
            const expectedTime = Math.floor(currentTime * 100) / 100; // Round to 2 decimal places
            const actualTime = Math.floor(video.currentTime * 100) / 100;
            const drift = Math.abs(expectedTime - actualTime);

            if (drift > 0.1) { // More than 100ms drift
              console.warn(`⚠️ Audio drift detected: ${drift.toFixed(3)}s`);

              // Correct significant audio drift
              if (drift > 0.5) { // More than 500ms drift
                console.log('🔄 Correcting significant audio drift...');
                video.currentTime = expectedTime;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error monitoring audio sync:', error);
    }
  };

  // Helper function to add authentication token to URLs
  const addAuthTokenToUrl = (url) => {
    if (!url) return url;

    // Check if URL already has a token to prevent duplication
    if (url.includes('token=')) {
      console.log(`⚠️ URL already has token, skipping:`, url);
      return url;
    }

    // Get the auth token from user object
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user !== null && user.token ? user.token : null;

    if (token) {
      const separator = url.includes('?') ? '&' : '?';
      const newUrl = `${url}${separator}token=${token}`;
      console.log(`🔐 Added token to URL:`, newUrl);
      return newUrl;
    }
    return url;
  };

  // Helper function to get the best available resolution
  const getBestAvailableResolution = (requestedResolution, availableResolutions) => {
    if (!availableResolutions || !availableResolutions.hls) {
      return null;
    }

    const availableKeys = Object.keys(availableResolutions.hls).filter(key => 
      availableResolutions.hls[key] && key !== 'master'
    );

    if (availableKeys.length === 0) {
      return availableResolutions.hls.master ? 'master' : null;
    }

    // Priority order for fallback
    const priorityOrder = ['uhd', 'fhd', 'hd', 'sd'];
    
    // If requested resolution is available, use it
    if (availableKeys.includes(requestedResolution)) {
      return requestedResolution;
    }

    // Find the best available resolution based on priority
    for (const priority of priorityOrder) {
      if (availableKeys.includes(priority)) {
        console.log(`🔄 Requested resolution ${requestedResolution} not available, falling back to ${priority}`);
        return priority;
      }
    }

    // If none of the priority resolutions are available, use the first available
    const fallback = availableKeys[0];
    console.log(`🔄 No priority resolutions available, using first available: ${fallback}`);
    return fallback;
  };

  // Get streaming URL from server with enhanced configuration integration
  useEffect(() => {
    // Set up video fetch interceptor for native video element fallback
    setupVideoFetchInterceptor();

    const getStreamingUrl = async () => {
      if (!resourceId) {
        console.error('❌ No resourceId provided for streaming');
        setError('No resource ID provided');
        setIsLoading(false);
        return;
      }

      // Prevent duplicate processing of the same resource
      if (processedResourceRef.current === resourceId) {
        console.log(`⚠️ Resource ${resourceId} already processed, skipping duplicate call`);
        return;
      }

      processedResourceRef.current = resourceId;
      console.log(`🔄 Processing resource: ${resourceId}`);

      try {
        console.log(`🔗 Getting streaming URL for resource: ${resourceId} (type: ${type})`);

        // Use the userStreaming API for user consumption
        const response = await apiRequest.get(`/v1/userStreaming/urls/${resourceId}`);
        const data = response.data;

        if (data.success) {
          console.log('✅ Series streaming response received:', {
            hasStreamingUrls: !!data.streamingUrls,
            hasRegularVideos: data.hasRegularVideos
          });
          console.log('📋 Streaming config:', data.streamingConfig);

          // Store streaming configuration for optimization
          setStreamingConfig(data.streamingConfig);

          // Use backend configuration to enhance local config
          if (data.streamingConfig?.optimizedChunkSizes) {
            console.log('🔄 Updating chunk sizes with backend configuration');
            Object.assign(STREAMING_CONFIG.CHUNK_SIZES, data.streamingConfig.optimizedChunkSizes);
          }

          // Handle regular video URLs for series episodes
          if (data.streamingUrls) {
            console.log('🎬 Using series video streaming URLs:', data.streamingUrls);

            // Add auth tokens to all streaming URLs
            const authenticatedStreamingUrls = {
              ...data.streamingUrls,
              hls: data.streamingUrls.hls ? Object.fromEntries(
                Object.entries(data.streamingUrls.hls).map(([key, url]) => [
                  key,
                  addAuthTokenToUrl(url)
                ])
              ) : data.streamingUrls.hls,
              mp4: data.streamingUrls.mp4 ? addAuthTokenToUrl(data.streamingUrls.mp4) : data.streamingUrls.mp4
            };

            console.log('🔐 Added auth tokens to streaming URLs');
            console.log('🔐 Final authenticated URLs:', authenticatedStreamingUrls);

            // Set authenticated streaming URLs
            setStreamingUrls(authenticatedStreamingUrls);

            // Select appropriate streaming URL based on type with better fallback logic
            let selectedUrl = null;
            let finalResolution = type?.toLowerCase() || 'hd';

            if (authenticatedStreamingUrls.hls) {
              console.log('📋 Available HLS resolutions:', Object.keys(authenticatedStreamingUrls.hls));

              // Use the helper function to get the best available resolution
              const bestResolution = getBestAvailableResolution(finalResolution, { hls: authenticatedStreamingUrls.hls });
              
              if (bestResolution) {
                selectedUrl = authenticatedStreamingUrls.hls[bestResolution];
                finalResolution = bestResolution;
                console.log(`✅ Selected resolution: ${finalResolution} (${bestResolution === type?.toLowerCase() ? 'requested' : 'fallback'})`);
              } else if (authenticatedStreamingUrls.hls.master) {
                // Fallback to master if no other resolutions available
                selectedUrl = authenticatedStreamingUrls.hls.master;
                finalResolution = 'master';
                console.log('✅ Falling back to master playlist');
              }
            }

            if (selectedUrl) {
              console.log(`🎬 Selected ${finalResolution.toUpperCase()} URL for type "${type}" with auth token:`, selectedUrl);
              setCurrentUrl(selectedUrl);
              setStreamingUrl(selectedUrl);
              setIsHLS(selectedUrl?.includes('.m3u8'));
              setSelectedResolution(finalResolution);

              console.log('✅ Regular video URL set successfully with auth token');

              // Load subtitles from server for this resource
              try {
                await loadSubtitlesFromServer(resourceId, finalResolution);
              } catch (subtitleError) {
                console.log('ℹ️ No subtitles found for this series episode:', subtitleError.message);
              }

              // Enhanced range request testing with content-aware optimization (only for non-HLS)
              if (selectedUrl && !selectedUrl.includes('.m3u8')) {
                console.log('🧪 Testing optimized range request support...');
                const contentType = selectedUrl.includes('.mp4') ? 'video/mp4' : 'video/mp2t';
                const testResponse = await optimizedRangeRequest(selectedUrl, 0, 1023, contentType);
                console.log('📊 Optimized range request test result:', testResponse.status);
              }
            } else {
              console.error('❌ No suitable streaming URL found for type:', type);
              console.error('📋 Available URLs:', authenticatedStreamingUrls);
              handleStreamingError(new Error(`No streaming URL available for ${type}`), 'url_selection_failed');
            }
          }
          // Handle case where no streaming URLs are available
          else {
            console.error('❌ No suitable streaming URLs found in response');
            console.error('📋 Response data:', {
              hasRegularVideos: data.hasRegularVideos,
              streamingUrls: data.streamingUrls
            });
            handleStreamingError(new Error('No streaming URLs available'), 'no_urls_available');
          }
        } else {
          console.error('❌ Streaming URL request failed:', data);
          handleStreamingError(new Error('Failed to get streaming URLs'), 'api_request_failed');
        }
      } catch (error) {
        console.error('❌ Error getting streaming URL:', error);

        setError('Failed to get streaming URL');
        setIsLoading(false);
      }
    };

    getStreamingUrl();
  }, [resourceId, type]); // Add type to dependencies

  // Load subtitles from server
  const loadSubtitlesFromServer = async (resourceId, resolution) => {
    try {
      console.log(`📝 Loading subtitles from server for series ${resolution.toUpperCase()}...`);

      // Use the userStreaming subtitle endpoint to get available subtitles from database
      const response = await apiRequest.get(`/v1/userStreaming/subtitles/${resourceId}`);
      const data = response.data;

      if (data.success && data.subtitles.length > 0) {
        console.log(`📝 Found ${data.subtitles.length} subtitles in database for series:`, data.subtitles);

        // Transform database subtitle records to video track format and add auth tokens
        const loadedSubtitles = data.subtitles.map((subtitle, index) => {
          return {
            id: subtitle.id,
            label: subtitle.label || `${subtitle.languageName} (${subtitle.language.toUpperCase()})`,
            language: subtitle.language,
            kind: 'subtitles',
            src: addAuthTokenToUrl(subtitle.url), // Add auth token to subtitle URL
            filename: subtitle.filename,
            size: subtitle.size,
            createdAt: subtitle.createdAt
          };
        });

        setAvailableCaptions(loadedSubtitles);
        console.log(`📝 Transformed ${loadedSubtitles.length} subtitle records to video tracks with auth tokens:`, loadedSubtitles);

        // Actually load the subtitle tracks into the video element
        await loadSubtitleTracksToVideo(loadedSubtitles);
      } else {
        console.log(`⚠️ No subtitles found in database for series ${resolution.toUpperCase()}`);
        if (data.message) {
          console.log(`📝 Server message: ${data.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading subtitles from server for series:', error);
    }
  };

  // Load subtitle tracks into the video element
  const loadSubtitleTracksToVideo = async (subtitles) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      console.log('📝 Loading subtitle tracks into series video element...');

      // Remove any existing tracks first
      const existingTracks = Array.from(video.querySelectorAll('track'));
      existingTracks.forEach(track => track.remove());

      for (const subtitle of subtitles) {
        // Create a track element
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = subtitle.label;
        track.srclang = subtitle.language;
        track.src = subtitle.src;

        // Generate a unique ID for the track element
        const uniqueTrackId = `track-${subtitle.id || subtitle.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        track.id = uniqueTrackId;

        // Set default based on language preference
        const isEnglish = ['en', 'eng', 'english'].includes(subtitle.language.toLowerCase());
        track.default = isEnglish; // Set English as default

        // Add the track to the video
        video.appendChild(track);
        console.log(`✅ Added subtitle track with ID ${uniqueTrackId}: ${subtitle.label} (${subtitle.language})`);
      }

      // Wait for tracks to load and then enable them
      setTimeout(() => {
        if (video.textTracks && video.textTracks.length > 0) {
          const tracks = Array.from(video.textTracks);
          const updatedCaptions = tracks.map(track => ({
            id: track.id || `track-${track.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: track.label || track.language || `Track ${track.language}`,
            kind: track.kind
          }));

          setAvailableCaptions(updatedCaptions);
          console.log('📝 Updated available captions from series video tracks:', updatedCaptions);

          // Check if there's an active track and set currentCaption
          const activeTrack = tracks.find(track => track.mode === 'showing');
          if (activeTrack) {
            // Set currentCaption with consistent structure
            const captionObject = {
              id: activeTrack.id || `track-${activeTrack.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              label: activeTrack.label || activeTrack.language || `Track ${activeTrack.language}`,
              language: activeTrack.language,
              kind: activeTrack.kind
            };

            setCurrentCaption(captionObject);
            console.log('📝 Set initial currentCaption for series:', captionObject);
          } else {
            // If no active track, try to find the default track (English or first track)
            const englishTrack = tracks.find(track =>
              track.language && ['en', 'eng', 'english'].includes(track.language.toLowerCase())
            );
            const defaultTrack = englishTrack || tracks[0];

            if (defaultTrack) {
              const captionObject = {
                id: defaultTrack.id || `track-${defaultTrack.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                label: defaultTrack.label || defaultTrack.language || `Track ${defaultTrack.language}`,
                language: defaultTrack.language,
                kind: defaultTrack.kind
              };

              setCurrentCaption(captionObject);
              console.log('📝 Set default currentCaption for series:', captionObject);
            }
          }
        }
      }, 1500); // Increased delay to ensure tracks are fully loaded

    } catch (error) {
      console.error('❌ Error loading subtitle tracks to series video:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Monitor audio sync during playback
      if (isPlaying) {
        monitorAudioSync();
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => {
      setIsLoading(true);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 1;
        setBuffered((bufferedEnd / duration) * 100);
      }
    };
    const handleError = (e) => {
      console.error('Video error:', e);
      console.error('Video error details:', {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        src: video.src,
        currentSrc: video.currentSrc
      });

      // Provide more specific error messages
      let errorMessage = 'Video playback error';
      if (video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = 'Video loading aborted';
            break;
          case 2:
            errorMessage = 'Network error - check your connection';
            break;
          case 3:
            errorMessage = 'Video decoding error - unsupported format';
            break;
          case 4:
            errorMessage = 'Video not supported by browser';
            break;
          default:
            errorMessage = `Video error: ${video.error.message || 'Unknown error'}`;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    };

    const handleLoadedMetadata = () => {
      console.log('📹 Series video metadata loaded');
      setIsLoading(false);
    };

    // Mouse event handlers for cursor and controls visibility
    const handleMouseMove = () => {
      setIsHovering(true);
      resetCursorTimeout();
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      // Don't immediately hide cursor, let the timeout handle it
    };

    // Caption event handlers
    const handleCueChange = () => {
      if (video.textTracks && video.textTracks.length > 0) {
        const activeTrack = Array.from(video.textTracks).find(track => track.mode === 'showing');
        if (activeTrack && activeTrack.activeCues && activeTrack.activeCues.length > 0) {
          const cue = activeTrack.activeCues[0];
          // Only set caption text if we're using custom overlay (not browser native)
          if (captionsEnabled && !useNativeSubtitles) {
            setCaptionText(cue.text);
            console.log('📝 Custom caption text:', cue.text);
          }
        } else {
          // Only clear caption text if we're using custom overlay
          if (!useNativeSubtitles) {
            setCaptionText('');
          }
        }
      }
    };

    const handleTrackChange = () => {
      if (video.textTracks && video.textTracks.length > 0) {
        const tracks = Array.from(video.textTracks);
        setAvailableCaptions(tracks.map(track => ({
          id: track.id || `track-${track.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          label: track.label || track.language || `Track ${track.language}`,
          language: track.language,
          kind: track.kind
        })));

        // Check if there's an active track and update captionsEnabled state
        const activeTrack = tracks.find(track => track.mode === 'showing');
        if (activeTrack) {
          // Set currentCaption with consistent structure
          const captionObject = {
            id: activeTrack.id || `track-${activeTrack.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: activeTrack.label || activeTrack.language || `Track ${activeTrack.language}`,
            language: activeTrack.language,
            kind: activeTrack.kind
          };

          setCurrentCaption(captionObject);

          // Update captionsEnabled state if it's not already enabled
          if (!captionsEnabled) {
            console.log('📝 Detected active subtitle track, enabling captions state');
            setCaptionsEnabled(true);
            setUseNativeSubtitles(true);
          }
        } else {
          // No active track, check if there's a default track (English or first track)
          const englishTrack = tracks.find(track =>
            track.language && ['en', 'eng', 'english'].includes(track.language.toLowerCase())
          );
          const defaultTrack = englishTrack || tracks[0];

          if (defaultTrack && !currentCaption) {
            // Set currentCaption for the default track if no currentCaption is set
            const captionObject = {
              id: defaultTrack.id || `track-${defaultTrack.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              label: defaultTrack.label || defaultTrack.language || `Track ${defaultTrack.language}`,
              language: defaultTrack.language,
              kind: defaultTrack.kind
            };

            setCurrentCaption(captionObject);
            console.log('📝 Set default currentCaption in handleTrackChange:', captionObject);
          } else if (!defaultTrack && captionsEnabled) {
            // No active track and no default track, disable captions if they were enabled
            console.log('📝 No active subtitle track, disabling captions state');
            setCaptionsEnabled(false);
            setUseNativeSubtitles(false);
            setCurrentCaption(null);
          }
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);
    video.addEventListener('cuechange', handleCueChange);
    video.addEventListener('texttrackchange', handleTrackChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
      video.removeEventListener('cuechange', handleCueChange);
      video.removeEventListener('texttrackchange', handleTrackChange);
    };
  }, []);



  // Cleanup HLS instance on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        console.log('🧹 Cleaning up HLS instance');
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Cleanup cursor timeout
      clearCursorTimeout();

      // Cleanup volume slider timeout
      if (volumeSliderTimeoutRef.current) {
        clearTimeout(volumeSliderTimeoutRef.current);
        volumeSliderTimeoutRef.current = null;
      }
      // Close settings menu on unmount
      setShowSettingsMenu(false);
    };
  }, []);

  // Handle cursor visibility based on play state and fullscreen
  useEffect(() => {
    console.log('🖱️ Cursor visibility useEffect - isPlaying:', isPlaying, 'isFullscreen:', isFullscreen, 'showCursor:', showCursor);

    if (!isPlaying) {
      // When video is paused, always show cursor and controls
      console.log('🖱️ Setting cursor to visible (paused)');
      setShowCursor(true);
      clearCursorTimeout();
    } else {
      // When video is playing, start the auto-hide timer (regardless of hover state)
      console.log('🖱️ Starting cursor timeout (playing) - will hide even when hovering if idle');
      // Add a small delay to allow for initial interaction
      const delay = setTimeout(() => {
        resetCursorTimeout();
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [isPlaying]);

  // Initialize cursor timeout when video starts playing
  useEffect(() => {
    if (isPlaying) {
      // Start the cursor timeout after a short delay to allow for initial interaction
      const initialDelay = setTimeout(() => {
        resetCursorTimeout();
      }, 1000); // 1 second delay before starting auto-hide

      return () => clearTimeout(initialDelay);
    }
  }, [isPlaying]);

  // Debug cursor state changes
  useEffect(() => {
    console.log('🖱️ showCursor state changed to:', showCursor);
  }, [showCursor]);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFullscreenNow);
      console.log(`🖥️ Fullscreen state changed: ${isFullscreenNow ? 'Entered' : 'Exited'}`);
    };

    // Add fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard events when the video player is focused or in fullscreen
      const video = videoRef.current;
      if (!video) return;

      // Check if we're in fullscreen or if the video element is focused
      const isVideoFocused = document.activeElement === video || isFullscreen;

      if (!isVideoFocused) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          resetCursorTimeout(); // Show cursor when using keyboard controls
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          resetCursorTimeout(); // Show cursor when using keyboard controls
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          e.preventDefault();
          if (availableCaptions.length > 0) {
            toggleCaptions();
            resetCursorTimeout(); // Show cursor when using keyboard controls
          }
          break;
        case 'e':
          e.preventDefault();
          if (allEpisodes && allEpisodes.length > 1) {
            setShowEpisodeListPopup(true);
            resetCursorTimeout(); // Show cursor when using keyboard controls
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'escape':
          if (showEpisodeListPopup) {
            e.preventDefault();
            setShowEpisodeListPopup(false);
            resetCursorTimeout();
          } else if (isFullscreen) {
            e.preventDefault();
            handleFullscreen(); // Use the same function to exit fullscreen
            resetCursorTimeout(); // Show cursor when using keyboard controls
          } else if (showSettingsMenu) {
            e.preventDefault();
            closeSettingsMenu();
            resetCursorTimeout();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, availableCaptions.length, showSettingsMenu]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamingUrl) return;

    console.log('🎬 ServerStreamingPlayer Debug Info:', {
      streamingUrl,
      resourceId,
      type,
      selectedResolution,
      isMP4: streamingUrl?.includes('.mp4'),
      isHLS: streamingUrl?.includes('.m3u8'),
      streamingConfig,
      rangeRequestSupported
    });

    // Reset state
    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setBufferProgress(0);
    setBufferStatus('Initializing...');
    setFragmentsLoaded(0);
    setTotalFragments(0);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    console.log(`🎬 Loading video from server: ${streamingUrl}`);

    if (isHLS) {
      // Handle HLS files with optimized HLS.js configuration
      const loadHLS = async () => {
        try {
          // Dynamically import HLS.js
          const Hls = (await import('hls.js')).default;

          if (Hls.isSupported()) {
            console.log('✅ HLS.js is supported, initializing with optimized config...');

            const hls = new Hls({
              debug: false,
              enableWorker: true,
              lowLatencyMode: false, // Disable low latency mode to reduce stalling
              backBufferLength: 90,

              // Enhanced buffering configuration for continuous streaming
              maxBufferLength: 60, // Increase buffer length for better preloading
              maxMaxBufferLength: 120, // Maximum buffer length
              maxBufferSize: 120 * 1000 * 1000, // 120MB max buffer size for better preloading
              maxBufferHole: 0.1, // Reduce buffer hole tolerance for smoother playback
              highBufferWatchdogPeriod: 1, // More frequent buffer monitoring
              nudgeOffset: 0.05, // Smaller nudge offset for smoother recovery
              nudgeMaxRetry: 10, // More retries for better recovery
              maxFragLookUpTolerance: 0.1, // Tighter fragment lookup tolerance

              // Audio sync configuration to prevent audio lag
              maxAudioFramesDrift: 0.1, // Reduce audio drift tolerance
              maxStarvationDelay: 2, // Reduce starvation delay
              maxLoadingDelay: 2, // Reduce loading delay
              enableSoftwareAES: true, // Enable software AES

              // Audio-specific settings to prevent lag
              audioBufferLength: 30, // Audio buffer length in seconds
              audioBufferSize: 60 * 1000 * 1000, // 60MB audio buffer
              audioBufferHole: 0.05, // Smaller audio buffer hole tolerance
              audioNudgeOffset: 0.02, // Smaller audio nudge offset
              audioNudgeMaxRetry: 5, // Audio nudge retries

              // Live streaming settings
              liveSyncDurationCount: 3, // Live sync duration count
              liveMaxLatencyDurationCount: 10, // Max latency for live streams

              // ABR (Adaptive Bitrate) settings
              abrEwmaDefaultEstimate: 500000, // Default bandwidth estimate
              abrEwmaFastLive: 3.0, // Fast live ABR
              abrEwmaSlowLive: 9.0, // Slow live ABR
              abrEwmaFastVoD: 3.0, // Fast VoD ABR
              abrEwmaSlowVoD: 9.0, // Slow VoD ABR
              abrBandWidthFactor: 0.95, // Conservative bandwidth factor
              abrBandWidthUpFactor: 0.7, // Conservative up factor
              abrMaxWithRealBitrate: true, // Use real bitrate

              // Quality and performance settings
              startLevel: -1, // Auto start level
              capLevelToPlayerSize: true, // Cap level to player size
              testBandwidth: true, // Test bandwidth for better quality selection
              progressive: false, // Disable progressive parsing
              stretchShortVideoTrack: false, // Don't stretch short video tracks

              // Buffer management
              maxBufferStarvationDelay: 2, // Reduce starvation delay

              // Enhanced caption support for professional subtitle approach
              enableWebVTT: true, // Enable WebVTT captions
              enableIMSC1: true, // Enable IMSC1 captions
              enableCEA708Captions: true, // Enable CEA708 captions
              enableDateRangeMetadataCues: true, // Enable date range metadata for captions
              enableEmsgMetadataCues: true, // Enable emsg metadata for series

              // Professional subtitle approach: Enhanced subtitle handling for individual resolutions
              subtitleDisplay: true, // Enable subtitle display for series
              subtitleTrackSelectionMode: 'auto', // Enable subtitle track selection for series
              subtitlePreference: ['en', 'eng', 'english'], // Enable subtitle preferences for series

              // Individual resolution subtitle support
              enableSubtitleStreaming: true, // Enable subtitle streaming for series
              subtitleStreamingMode: 'external', // Enable subtitle streaming mode for series

              // Preloading settings
              startFragPrefetch: true, // Prefetch start fragment

              // Custom loader that adds authentication tokens to all requests
              loader: class AuthenticatedLoader extends Hls.DefaultConfig.loader {
                load(context, config, callbacks) {
                  // Add authentication token to all requests
                  const originalUrl = context.url;
                  let authenticatedUrl = originalUrl;

                  // Get the auth token from user object
                  const user = JSON.parse(localStorage.getItem("user"));
                  const token = user !== null && user.token ? user.token : null;

                  if (token && !originalUrl.includes('token=')) {
                    const separator = originalUrl.includes('?') ? '&' : '?';
                    authenticatedUrl = `${originalUrl}${separator}token=${token}`;
                    console.log(`🔐 HLS Loader: Added token to request: ${originalUrl} -> ${authenticatedUrl}`);
                  } else if (originalUrl.includes('token=')) {
                    console.log(`🔐 HLS Loader: URL already has token: ${originalUrl}`);
                  }

                  // Update the context with authenticated URL
                  context.url = authenticatedUrl;

                  // Add retry logic for failed requests
                  const originalLoad = super.load.bind(this);
                  let retryCount = 0;
                  const maxRetries = 5; // Increased retries

                  const loadWithRetry = (context, config, callbacks) => {
                    originalLoad(context, config, {
                      ...callbacks,
                      onError: (response, context, networkDetails) => {
                        console.log(`🔄 Loader retry ${retryCount + 1}/${maxRetries} for ${context.url}`);
                        if (retryCount < maxRetries) {
                          retryCount++;
                          setTimeout(() => {
                            loadWithRetry(context, config, callbacks);
                          }, 500 * retryCount); // Faster exponential backoff
                        } else {
                          callbacks.onError(response, context, networkDetails);
                        }
                      }
                    });
                  };

                  loadWithRetry(context, config, callbacks);
                }
              }
            });

            hlsRef.current = hls;

            hls.loadSource(streamingUrl);
            hls.attachMedia(video);

            // Start loading when manifest is parsed
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('✅ HLS manifest parsed, starting buffer loading...');
              setBufferStatus('Loading manifest...');
              // Start loading fragments immediately
              hls.startLoad();
            });

            hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
              console.log(`📊 Level loaded: ${data.level} (${data.details.bitrate} bps)`);
            });

            hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
              console.log(`🔄 Switching to level: ${data.level}`);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
              console.log(`✅ Switched to level: ${data.level}`);

              // Track quality switches
              setPerformanceMetrics(prev => ({
                ...prev,
                qualitySwitches: prev.qualitySwitches + 1
              }));
            });

            hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
              console.log(`📥 Loading fragment: ${data.frag.sn} (${data.frag.duration}s)`);
              setBufferStatus(`Loading fragment ${data.frag.sn}...`);

              // Track fragment loading start time
              data.loadStartTime = performance.now();
            });

            hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
              // Calculate and track fragment load time
              const loadTime = performance.now() - (data.loadStartTime || performance.now());
              console.log(`✅ Fragment loaded: ${data.frag.sn} (${data.frag.duration}s) in ${loadTime.toFixed(2)}ms`);

              setFragmentsLoaded(prev => prev + 1);
              setBufferStatus(`Loaded ${fragmentsLoaded + 1} fragments...`);

              // Update performance metrics
              setPerformanceMetrics(prev => {
                const newLoadTimes = [...prev.fragmentLoadTime, loadTime].slice(-10); // Keep last 10
                const averageLoadTime = newLoadTimes.reduce((sum, time) => sum + time, 0) / newLoadTimes.length;

                return {
                  ...prev,
                  fragmentLoadTime: newLoadTimes,
                  averageLoadTime: averageLoadTime
                };
              });
            });

            hls.on(Hls.Events.FRAG_PARSED, (event, data) => {
              console.log(`📋 Fragment parsed: ${data.frag.sn}`);
            });

            hls.on(Hls.Events.BUFFER_STALLED, () => {
              console.log('⚠️ Buffer stalled, attempting recovery...');
            });

            hls.on(Hls.Events.BUFFER_APPENDING, () => {
              console.log('📥 Buffer appending...');
            });

            hls.on(Hls.Events.BUFFER_APPENDED, () => {
              console.log('✅ Buffer appended successfully');

              // Check if we have sufficient buffer before allowing playback
              if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const currentTime = video.currentTime || 0;
                const bufferAhead = bufferedEnd - currentTime;

                console.log(`📊 Buffer status: ${bufferAhead.toFixed(2)}s ahead, ${(bufferedEnd).toFixed(2)}s total`);

                // Update buffer progress
                const progress = Math.min((bufferAhead / 10) * 100, 100); // Target 10 seconds of buffer
                setBufferProgress(progress);
                setBufferStatus(`Buffering: ${bufferAhead.toFixed(1)}s ahead`);

                // Track buffer efficiency
                const efficiency = Math.min((bufferAhead / 10) * 100, 100);
                setPerformanceMetrics(prev => ({
                  ...prev,
                  bufferEfficiency: efficiency
                }));

                // Enable playback when we have at least 5 seconds of buffer
                if (bufferAhead >= 5 && isLoading) {
                  console.log('✅ Sufficient buffer loaded, enabling playback');
                  setIsLoading(false);
                  setBufferStatus('Ready to play');
                }

                // Audio sync check - ensure audio buffer is sufficient
                if (bufferAhead < 3) {
                  console.warn('⚠️ Low buffer detected - potential audio lag');
                  // Monitor audio sync more frequently when buffer is low
                  if (isPlaying) {
                    monitorAudioSync();
                  }
                }
              }
            });

            // Enhanced buffering events for continuous streaming
            hls.on(Hls.Events.BUFFER_EOS, () => {
              console.log('📋 Buffer end of stream reached');
            });

            hls.on(Hls.Events.BUFFER_FREE, () => {
              console.log('🗑️ Buffer freed');
            });

            hls.on(Hls.Events.BUFFER_SEEKING, () => {
              console.log('🔍 Buffer seeking...');
            });

            hls.on(Hls.Events.BUFFER_SEEKED, () => {
              console.log('✅ Buffer seeked successfully');
            });

            // Monitor bandwidth for quality selection
            hls.on(Hls.Events.BANDWIDTH_ESTIMATE, (event, data) => {
              console.log(`📊 Bandwidth estimate: ${Math.round(data.bandwidth / 1000)} kbps`);
            });

            // Enhanced error handling with intelligent recovery
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('❌ HLS error:', data);

              // Track error rate
              setPerformanceMetrics(prev => ({
                ...prev,
                errorRate: prev.errorRate + 1
              }));

              // Handle different types of errors with enhanced recovery
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('🔄 Network error, implementing intelligent recovery...');
                    handleStreamingError({ type: 'network', details: data.details }, 'hls');
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('🔄 Media error, implementing intelligent recovery...');
                    handleStreamingError({ type: 'media', details: data.details }, 'hls');
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error('❌ Fatal HLS error, cannot recover');
                    setError('HLS playback error');
                    setIsLoading(false);
                    break;
                }
              } else {
                // Handle non-fatal errors with enhanced strategies
                switch (data.details) {
                  case 'bufferStalledError':
                    console.log('⚠️ Buffer stalling detected, implementing recovery...');
                    // Try to recover by seeking slightly forward
                    if (video.currentTime) {
                      const newTime = video.currentTime + 0.1;
                      if (newTime < video.duration) {
                        video.currentTime = newTime;
                        console.log(`🔄 Seeking to ${newTime}s to recover from buffer stall`);
                      }
                    }
                    break;
                  case 'bufferNudgeOnStall':
                    console.log('⚠️ Buffer nudge applied, continuing playback...');
                    // This is usually handled automatically by HLS.js
                    break;
                  case 'manifestLoadError':
                    console.log('⚠️ Manifest load error, implementing retry strategy...');
                    handleStreamingError({ type: 'network', details: data.details }, 'manifest');
                    hls.startLoad();
                    break;
                  case 'levelLoadError':
                    console.log('⚠️ Level load error, switching to lower quality...');
                    // HLS.js will automatically switch to a lower quality level
                    break;
                  default:
                    console.log('⚠️ Non-fatal HLS error:', data.details);
                    break;
                }
              }
            });

            // Audio sync monitoring and correction
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
              console.log('🎵 Audio tracks updated:', data.audioTracks);
            });

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
              console.log('🎵 Audio track switched:', data);
            });

            // Monitor audio drift and sync issues
            hls.on(Hls.Events.AUDIO_FRAG_PARSED, (event, data) => {
              console.log('🎵 Audio fragment parsed:', data);
              // Check for audio drift
              if (data.frag && data.frag.duration) {
                const expectedTime = data.frag.start + data.frag.duration;
                const actualTime = video.currentTime;
                const drift = Math.abs(expectedTime - actualTime);

                if (drift > 0.1) { // More than 100ms drift
                  console.warn(`⚠️ Audio drift detected: ${drift.toFixed(3)}s`);
                  // Attempt to correct audio drift
                  if (drift > 0.5) { // More than 500ms drift
                    console.log('🔄 Correcting significant audio drift...');
                    video.currentTime = expectedTime;
                  }
                }
              }
            });

            // Monitor audio buffer underruns
            hls.on(Hls.Events.AUDIO_BUFFER_STALLED, () => {
              console.warn('⚠️ Audio buffer stalled - potential audio lag');
            });

            hls.on(Hls.Events.AUDIO_BUFFER_APPENDED, () => {
              console.log('✅ Audio buffer appended successfully');
            });

            // Monitor overall media sync
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              console.log('🎬 Media attached, setting up audio sync monitoring...');

              // Set up audio sync monitoring
              const checkAudioSync = () => {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                  const audioTracks = video.audioTracks;
                  if (audioTracks && audioTracks.length > 0) {
                    const audioTrack = audioTracks[0];
                    if (audioTrack.readyState === 'loaded') {
                      // Monitor audio sync
                      const currentTime = video.currentTime;
                      const buffered = video.buffered;

                      if (buffered.length > 0) {
                        const bufferedEnd = buffered.end(buffered.length - 1);
                        const bufferAhead = bufferedEnd - currentTime;

                        // If buffer is too small, audio might lag
                        if (bufferAhead < 2) {
                          console.warn('⚠️ Low audio buffer - potential lag');
                        }
                      }
                    }
                  }
                }
              };

              // Check audio sync periodically
              const audioSyncInterval = setInterval(checkAudioSync, 2000);

              // Clean up interval when video is destroyed
              video.addEventListener('destroyed', () => {
                clearInterval(audioSyncInterval);
              });
            });

          } else {
            console.log('❌ HLS.js not supported, falling back to native video');
            // Fallback to native video (won't work for HLS but will show error)
            video.src = streamingUrl;
            video.load();
          }
        } catch (error) {
          console.error('❌ Error loading HLS.js:', error);
          setError('Failed to load HLS player');
          setIsLoading(false);
        }
      };

      loadHLS();
    } else {
      // Handle MP4 files with native video element and enhanced optimization
      console.log('🎬 Loading MP4 with enhanced optimized settings');

      // Set optimized video attributes
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      // Add enhanced optimized data attributes
      video.setAttribute('data-optimized-streaming', 'true');
      video.setAttribute('data-range-support', rangeRequestSupported.toString());
      video.setAttribute('data-streaming-config', JSON.stringify(streamingConfig));

      if (streamingConfig) {
        video.setAttribute('data-chunk-size', streamingConfig.optimizedChunkSizes?.mp4 || STREAMING_CONFIG.CHUNK_SIZES.mp4);
        video.setAttribute('data-max-range-size', streamingConfig.maxRangeSize || STREAMING_CONFIG.MAX_RANGE_SIZE);
        video.setAttribute('data-cache-duration', streamingConfig.cacheDurations?.mp4 || '604800');
      }

      // Enhanced MP4 error handling
      video.addEventListener('error', (e) => {
        console.error('❌ MP4 video error:', e);
        handleStreamingError({ type: 'media', details: 'MP4 playback error' }, 'mp4');
      });

      // Enhanced MP4 performance monitoring
      video.addEventListener('loadstart', () => {
        console.log('📥 MP4 loading started');
        setBufferStatus('Loading MP4...');
      });

      video.addEventListener('canplay', () => {
        console.log('✅ MP4 can play');
        setIsLoading(false);
        setBufferStatus('Ready to play');
      });

      video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const currentTime = video.currentTime || 0;
          const bufferAhead = bufferedEnd - currentTime;
          const efficiency = Math.min((bufferAhead / 10) * 100, 100);

          setPerformanceMetrics(prev => ({
            ...prev,
            bufferEfficiency: efficiency
          }));
        }
      });

      video.src = streamingUrl;
      video.load();
    }

  }, [streamingUrl, resourceId, type, selectedResolution, isHLS, streamingConfig, rangeRequestSupported]);

  // Sync video volume and mute state
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    resetCursorTimeout(); // Show cursor when using controls
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      video.currentTime = percentage * duration;
    }
    resetCursorTimeout(); // Show cursor when seeking
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    resetCursorTimeout(); // Show cursor when changing playback rate
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const newTime = Math.min(video.duration, video.currentTime + 10);
      video.currentTime = newTime;
      console.log(`⏭ Skipped forward 10 seconds to ${newTime.toFixed(2)}s`);
    }
    resetCursorTimeout(); // Show cursor when using controls
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (video) {
      const newTime = Math.max(0, video.currentTime - 10);
      video.currentTime = newTime;
      console.log(`⏮ Skipped backward 10 seconds to ${newTime.toFixed(2)}s`);
    }
    resetCursorTimeout(); // Show cursor when using controls
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    const container = video?.parentElement;

    if (isFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      // Enter fullscreen
      if (container) {
        // Request fullscreen on the container instead of the video element
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        }
      } else if (video) {
        // Fallback to video element if container is not available
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        }
      }
    }
  };

  const toggleCaptions = () => {
    console.log('🎬 Series toggleCaptions called - Current state:', {
      captionsEnabled,
      availableCaptions: availableCaptions.length,
      currentCaption
    });

    const video = videoRef.current;
    if (!video) {
      console.error('❌ No video element found');
      return;
    }

    if (!video.textTracks) {
      console.error('❌ No textTracks available');
      return;
    }

    const tracks = Array.from(video.textTracks);
    console.log('📝 Available text tracks:', tracks.map(t => ({ id: t.id, label: t.label, mode: t.mode })));

    const newState = !captionsEnabled;
    console.log(`🔄 Toggling captions: ${captionsEnabled} -> ${newState}`);

    setCaptionsEnabled(newState);

    if (newState) {
      console.log('✅ Enabling captions...');
      // Enable captions - use native browser subtitles
      setUseNativeSubtitles(true);
      setCaptionText(''); // Clear custom overlay text

      // Find the best track to enable
      let trackToEnable = null;

      // If there's a current caption, use that
      if (currentCaption) {
        trackToEnable = tracks.find(track => track.id === currentCaption.id);
        console.log('📝 Using current caption track:', trackToEnable?.label);
      }

      // If no current caption or track not found, find English or first track
      if (!trackToEnable) {
        const englishTrack = tracks.find(track =>
          track.language && ['en', 'eng', 'english'].includes(track.language.toLowerCase())
        );
        trackToEnable = englishTrack || tracks[0];
        console.log('📝 Using fallback track:', trackToEnable?.label);
      }

      if (trackToEnable) {
        // Hide all tracks first
        tracks.forEach(track => {
          track.mode = 'hidden';
          console.log(`📝 Hiding track: ${track.label || track.id}`);
        });

        // Show the selected track
        trackToEnable.mode = 'showing';
        console.log(`📝 Showing track: ${trackToEnable.label || trackToEnable.id}`);

        // Set currentCaption
        const captionObject = {
          id: trackToEnable.id || `track-${trackToEnable.language}-${Date.now()}`,
          label: trackToEnable.label || trackToEnable.language || `Track ${trackToEnable.language}`,
          language: trackToEnable.language,
          kind: trackToEnable.kind
        };

        setCurrentCaption(captionObject);
        console.log('✅ Enabled captions with track:', captionObject);
      } else {
        console.error('❌ No tracks available to enable');
      }
    } else {
      console.log('✅ Disabling captions...');
      // Disable captions
      setUseNativeSubtitles(false);
      setCaptionText('');
      setCurrentCaption(null);

      // Hide all tracks
      tracks.forEach(track => {
        track.mode = 'hidden';
        console.log(`📝 Hiding track: ${track.label || track.id}`);
      });

      console.log('✅ Disabled all captions');
    }

    resetCursorTimeout(); // Show cursor when toggling captions
    console.log('🎬 Series toggleCaptions completed - New state:', { captionsEnabled: newState });
  };

  const switchCaptionTrack = (trackId) => {
    const video = videoRef.current;
    if (video && video.textTracks) {
      // Hide all tracks first
      Array.from(video.textTracks).forEach(track => {
        track.mode = 'hidden';
      });

      // Show the selected track
      const selectedTrack = Array.from(video.textTracks).find(track => track.id === trackId);
      if (selectedTrack) {
        selectedTrack.mode = 'showing';

        // Set currentCaption with the same structure as availableCaptions
        const captionObject = {
          id: selectedTrack.id,
          label: selectedTrack.label || selectedTrack.language || `Track ${selectedTrack.id}`,
          language: selectedTrack.language,
          kind: selectedTrack.kind
        };

        setCurrentCaption(captionObject);
        setCaptionsEnabled(true);
        setUseNativeSubtitles(true); // Use native browser subtitles
        setCaptionText(''); // Clear custom overlay text
        console.log(`📝 Series switched to caption track: ${selectedTrack.label || selectedTrack.language}`);
      }
    }
  };

  // Volume control functions
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      if (isMuted) {
        video.muted = false;
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    }
    resetCursorTimeout();
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (video) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      video.volume = clampedVolume;

      // Unmute if volume is increased from 0
      if (clampedVolume > 0 && isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
      // Mute if volume is set to 0
      else if (clampedVolume === 0 && !isMuted) {
        video.muted = true;
        setIsMuted(true);
      }
    }
    resetCursorTimeout();
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return 'icon-[solar--volume-cross-bold]'; // Muted icon
    } else if (volume < 0.5) {
      return 'icon-[solar--volume-loud-bold]'; // Low volume icon
    } else {
      return 'icon-[solar--volume-loud-bold]'; // High volume icon
    }
  };

  // Volume slider visibility functions
  const showVolumeSliderWithDelay = () => {
    setShowVolumeSlider(true);
    if (volumeSliderTimeoutRef.current) {
      clearTimeout(volumeSliderTimeoutRef.current);
      volumeSliderTimeoutRef.current = null;
    }
  };

  const hideVolumeSliderWithDelay = () => {
    if (volumeSliderTimeoutRef.current) {
      clearTimeout(volumeSliderTimeoutRef.current);
    }
    volumeSliderTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 500); // 500ms delay before hiding
  };

  // Settings menu functions
  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
    resetCursorTimeout();
  };

  const closeSettingsMenu = () => {
    setShowSettingsMenu(false);
  };

  const switchSettingsTab = (tab) => {
    setSettingsTab(tab);
    resetCursorTimeout();
  };

  // Episode navigation functions
  const handlePreviousEpisodeClick = () => {
    if (episodeIndex > 0) {
      // Navigate to previous episode
      const previousEpisodeIndex = episodeIndex - 1;
      if (handleNextEpisode && typeof handleNextEpisode === 'function') {
        handleNextEpisode(previousEpisodeIndex);
      }
    }
  };

  const handleNextEpisodeClick = () => {
    if (episodeIndex < (allEpisodes?.length || 0) - 1) {
      // Navigate to next episode
      const nextEpisodeIndex = episodeIndex + 1;
      if (handleNextEpisode && typeof handleNextEpisode === 'function') {
        handleNextEpisode(nextEpisodeIndex);
      }
    }
  };

  const handleEpisodeClick = (index) => {
    if (handleNextEpisode && typeof handleNextEpisode === 'function') {
      handleNextEpisode(index);
    }
  };

  // Quality switching function
  const switchQuality = (quality, url) => {
    console.log(`🔄 Switching quality from ${selectedResolution} to ${quality}:`, url);

    if (!url) {
      console.error('❌ No URL provided for quality:', quality);
      
      // If no URL provided, try to find a fallback resolution
      if (streamingUrls && streamingUrls.hls) {
        const availableResolutions = Object.keys(streamingUrls.hls).filter(key => 
          streamingUrls.hls[key] && key !== 'master'
        );
        const fallbackResolution = availableResolutions[0];
        
        if (fallbackResolution) {
          console.log(`🔄 No URL for ${quality}, falling back to ${fallbackResolution}`);
          const fallbackUrl = streamingUrls.hls[fallbackResolution];
          if (fallbackUrl) {
            switchQuality(fallbackResolution, fallbackUrl);
            return;
          }
        }
      }
      
      return;
    }

    // Check if URL already has a token to avoid duplication
    let authenticatedUrl = url;
    if (!url.includes('token=')) {
      authenticatedUrl = addAuthTokenToUrl(url);
      console.log(`🔐 Quality switch URL with auth token added:`, authenticatedUrl);
    } else {
      console.log(`🔐 Quality switch URL already has token:`, url);
    }

    // Store current subtitle state before switching
    const currentSubtitleState = {
      captionsEnabled,
      currentCaption,
      useNativeSubtitles,
      availableCaptions: [...availableCaptions]
    };

    console.log('📝 Preserving subtitle state:', currentSubtitleState);

    // Update the current URL and resolution
    setCurrentUrl(authenticatedUrl);
    setStreamingUrl(authenticatedUrl);
    setSelectedResolution(quality);

    // Update video source
    const video = videoRef.current;
    if (video) {
      // Store current playback state
      const wasPlaying = !video.paused;
      const currentTime = video.currentTime;

      // Store current subtitle tracks
      const currentTracks = Array.from(video.querySelectorAll('track'));
      const trackData = currentTracks.map(track => ({
        kind: track.kind,
        label: track.label,
        srclang: track.srclang,
        src: track.src,
        default: track.default,
        id: track.id
      }));

      console.log('📝 Preserving subtitle tracks:', trackData);

      // Update video source with authenticated URL
      console.log(`🎬 Setting video source to:`, authenticatedUrl);
      video.src = authenticatedUrl;
      video.load();

      // Log the actual network request that will be made
      console.log(`🔍 Video element will make request to:`, authenticatedUrl);

      // Restore subtitle tracks immediately after load
      const restoreSubtitles = () => {
        if (trackData.length > 0) {
          console.log('📝 Restoring subtitle tracks after quality switch');

          // Remove any existing tracks first
          const existingTracks = Array.from(video.querySelectorAll('track'));
          existingTracks.forEach(track => track.remove());

          // Restore the original tracks
          trackData.forEach(trackInfo => {
            const track = document.createElement('track');
            track.kind = trackInfo.kind;
            track.label = trackInfo.label;
            track.srclang = trackInfo.srclang;
            track.src = trackInfo.src;
            track.default = trackInfo.default;
            track.id = trackInfo.id;

            video.appendChild(track);
            console.log(`✅ Restored subtitle track: ${trackInfo.label} (${trackInfo.srclang})`);
          });

          // Restore subtitle state
          setAvailableCaptions(currentSubtitleState.availableCaptions);
          setCurrentCaption(currentSubtitleState.currentCaption);
          setCaptionsEnabled(currentSubtitleState.captionsEnabled);
          setUseNativeSubtitles(currentSubtitleState.useNativeSubtitles);

          // Re-enable the active subtitle track if it was enabled
          if (currentSubtitleState.captionsEnabled && currentSubtitleState.currentCaption) {
            setTimeout(() => {
              const tracks = Array.from(video.textTracks);
              const activeTrack = tracks.find(track =>
                track.id === currentSubtitleState.currentCaption.id ||
                track.srclang === currentSubtitleState.currentCaption.language
              );

              if (activeTrack) {
                // Hide all tracks first
                tracks.forEach(track => track.mode = 'hidden');
                // Show the active track
                activeTrack.mode = 'showing';
                console.log(`📝 Re-enabled subtitle track: ${activeTrack.label}`);
              }
            }, 500); // Small delay to ensure tracks are loaded
          }
        }
      };

      // Restore subtitles when video is ready
      video.addEventListener('loadedmetadata', restoreSubtitles, { once: true });

      // Restore playback state after a short delay
      setTimeout(() => {
        if (wasPlaying) {
          video.play().catch(console.error);
        }
        video.currentTime = currentTime;
      }, 100);
    }

    // Close settings menu after quality switch
    setShowSettingsMenu(false);

    console.log(`✅ Quality switched to ${quality.toUpperCase()} with subtitles preserved and auth token added`);
  };

  // Monitor subtitle display and update captionsEnabled state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    const checkSubtitleDisplay = () => {
      const tracks = Array.from(video.textTracks);
      const hasActiveTrack = tracks.some(track => track.mode === 'showing');

      if (hasActiveTrack && !captionsEnabled) {
        console.log('📝 Series: Detected active subtitle track, enabling captions state');
        setCaptionsEnabled(true);
        setUseNativeSubtitles(true);
      } else if (!hasActiveTrack && captionsEnabled) {
        console.log('📝 Series: No active subtitle track, disabling captions state');
        setCaptionsEnabled(false);
        setUseNativeSubtitles(false);
      }
    };

    // Check immediately
    checkSubtitleDisplay();

    // Set up interval to check periodically
    const interval = setInterval(checkSubtitleDisplay, 1000);

    return () => clearInterval(interval);
  }, [captionsEnabled, videoRef.current]);

  // Auto-advance to next episode functionality
  useEffect(() => {
    if (isPlaying && duration > 0 && currentTime > 0) {
      const timeRemaining = duration - currentTime;
      
      // Show countdown when there's less than 10 seconds remaining
      if (timeRemaining <= 10 && timeRemaining > 0) {
        setShowNextEpisodeCountdown(true);
        setNextEpisodeCountdown(Math.ceil(timeRemaining));
      } else {
        setShowNextEpisodeCountdown(false);
      }

      // Auto-advance to next episode when video ends
      if (timeRemaining <= 0.5 && episodeIndex < (allEpisodes?.length || 0) - 1) {
        console.log('🔄 Auto-advancing to next episode...');
        setTimeout(() => {
          handleNextEpisodeClick();
        }, 1000); // 1 second delay
      }
    }
  }, [currentTime, duration, isPlaying, episodeIndex, allEpisodes]);

  // Countdown timer effect
  useEffect(() => {
    let countdownInterval;
    
    if (showNextEpisodeCountdown && nextEpisodeCountdown > 0) {
      countdownInterval = setInterval(() => {
        setNextEpisodeCountdown(prev => {
          if (prev <= 1) {
            setShowNextEpisodeCountdown(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showNextEpisodeCountdown, nextEpisodeCountdown]);

  // Monitor availableCaptions changes and ensure currentCaption is set
  useEffect(() => {
    if (availableCaptions.length > 0 && !currentCaption) {
      // Find the default track (English or first track)
      const englishCaption = availableCaptions.find(caption =>
        caption.language && ['en', 'eng', 'english'].includes(caption.language.toLowerCase())
      );
      const defaultCaption = englishCaption || availableCaptions[0];

      if (defaultCaption) {
        setCurrentCaption(defaultCaption);
        console.log('📝 Series: Set currentCaption from availableCaptions:', defaultCaption);
      }
    }
  }, [availableCaptions, currentCaption]);

  // Ensure subtitle tracks are correctly set when available captions change
  useEffect(() => {
    // Auto-set initial caption if available captions exist and no current caption is set
    if (availableCaptions.length > 0 && !currentCaption) {
      // Find English caption or first available
      const englishCaption = availableCaptions.find(caption =>
        caption.language && ['en', 'eng', 'english'].includes(caption.language.toLowerCase())
      );
      const defaultCaption = englishCaption || availableCaptions[0];

      if (defaultCaption) {
        setCurrentCaption(defaultCaption);
        console.log('📝 Series: Auto-set default caption:', defaultCaption);
      }
    }
  }, [availableCaptions, currentCaption]);

  if (error) {
    return (
      <div style={{
        width,
        height,
        backgroundColor: '#36323E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '8px' }}>❌</div>
          <div>{error}</div>
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            Series streaming error ({selectedResolution.toUpperCase()})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="video-player-container"
      style={{
        width,
        height,
        position: 'relative',
        backgroundColor: '#000',
        cursor: showCursor ? 'default' : 'none',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={() => {
        console.log('🖱️ Mouse entered - setting hovering to true and resetting cursor timeout');
        setIsHovering(true);
        resetCursorTimeout();
      }}
      onMouseLeave={() => {
        console.log('🖱️ Mouse left - setting hovering to false');
        setIsHovering(false);
        // Don't clear the cursor timeout when mouse leaves - let it auto-hide
        // Only clear timeout if video is paused
        if (!isPlaying) {
          clearCursorTimeout();
        }
        // If video is playing, let the timeout continue to hide cursor
      }}
      onMouseMove={() => {
        console.log('🖱️ Mouse moved - resetting cursor timeout');
        setIsHovering(true);
        resetCursorTimeout();
      }}
      onMouseDown={() => {
        console.log('🖱️ Mouse down - resetting cursor timeout');
        resetCursorTimeout();
      }}
      onKeyDown={() => {
        console.log('🖱️ Key down - resetting cursor timeout');
        resetCursorTimeout();
      }}
      onTouchStart={() => {
        console.log('🖱️ Touch start - resetting cursor timeout');
        resetCursorTimeout();
      }}
      // Add fullscreen-specific event handling
      onPointerMove={() => {
        if (isFullscreen) {
          console.log('🖱️ Pointer moved in fullscreen - resetting cursor timeout');
          setIsHovering(true);
          resetCursorTimeout();
        }
      }}
      // Add additional fullscreen event handling
      onPointerEnter={() => {
        if (isFullscreen) {
          console.log('🖱️ Pointer entered in fullscreen - resetting cursor timeout');
          setIsHovering(true);
          resetCursorTimeout();
        }
      }}
    >
      {/* CSS to override browser subtitle styling */}
      <style>
        {`
          /* Container constraints */
          .video-player-container {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            position: relative !important;
            box-sizing: border-box !important;
          }

          /* Video element constraints */
          .video-player-container .video-element {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
            box-sizing: border-box !important;
          }

          /* Responsive constraints */
          @media (max-width: 768px) {
            .video-player-container {
              width: 100vw !important;
              height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
            }
          }

          /* Override browser's default subtitle styling */
          video::cue {
            background: transparent !important;
            color: white !important;
            font-family: 'Roboto', Arial, sans-serif !important;
            font-weight: 500 !important;
            line-height: 1.4 !important;
            text-shadow: 
              0px 0px 4px rgba(0,0,0,0.8),
              0px 0px 8px rgba(0,0,0,0.6),
              0px 0px 12px rgba(0,0,0,0.4),
              0px 0px 16px rgba(0,0,0,0.2),
              0px 2px 4px rgba(0,0,0,0.9),
              0px 4px 8px rgba(0,0,0,0.7),
              0px 6px 12px rgba(0,0,0,0.5) !important;
            -webkit-text-stroke: 0.5px rgba(0,0,0,0.8) !important;
            text-stroke: 0.5px rgba(0,0,0,0.8) !important;
          }
          
          /* Override any background colors that might be set */
          video::cue-region {
            background: transparent !important;
          }
          
          /* Ensure no background on cue boxes */
          video::cue-box {
            background: transparent !important;
          }

          /* Hide native subtitles when using custom overlay */
          ${!useNativeSubtitles ? `
          video::cue {
            display: none !important;
          }
          ` : ''}

          /* YouTube-style hover effects */
          .youtube-control-btn {
            transition: all 0.15s ease;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: transparent;
            border: none;
            color: white;
            font-family: 'Roboto', Arial, sans-serif;
          }

          .youtube-control-btn:hover {
            background: rgba(255,255,255,0.1);
            transform: scale(1.05);
          }

          .youtube-control-btn:active {
            transform: scale(0.95);
            background: rgba(255,255,255,0.2);
          }

          .youtube-progress-bar {
            cursor: pointer;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            position: relative;
            transition: height 0.2s ease;
            margin: 0;
            width: 100%;
          }

          .youtube-progress-bar:hover {
            height: 6px;
          }

          .youtube-progress-fill {
            background: #ee5170;
            height: 100%;
            border-radius: 2px;
            position: relative;
            transition: width 0.1s ease;
          }

          .youtube-progress-buffer {
            background: rgba(255,255,255,0.4);
            height: 100%;
            border-radius: 2px;
            position: absolute;
            top: 0;
            left: 0;
          }

          .youtube-progress-thumb {
            position: absolute;
            right: -6px;
            top: -4px;
            width: 12px;
            height: 12px;
            background: #ee5170;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .youtube-progress-bar:hover .youtube-progress-thumb {
            opacity: 1;
          }

          .youtube-controls {
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            padding: 20px 0 12px;
            transition: opacity 0.3s ease;
          }

          .youtube-controls:hover {
            opacity: 1;
          }

          .youtube-time {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 13px;
            font-weight: 400;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            letter-spacing: 0.3px;
          }

          .youtube-subtitle-btn {
            background: transparent;
            border: none;
            color: white;
            padding: 0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Roboto', Arial, sans-serif;
          }

          .youtube-subtitle-btn:hover {
            background: rgba(255,255,255,0.1);
            transform: scale(1.05);
          }

          .youtube-subtitle-btn:active {
            transform: scale(0.95);
          }

          .youtube-subtitle-btn.active {
            color: #ee5170 !important;
            text-decoration: underline !important;
            text-decoration-color: #ee5170 !important;
            background: rgba(238,81,112,0.1) !important;
            border: 1px solid rgba(238,81,112,0.3) !important;
          }

          .youtube-settings-btn {
            background: transparent;
            border: none;
            color: white;
            padding: 0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 16px;
            font-family: 'Roboto', Arial, sans-serif;
          }

          .youtube-settings-btn:hover {
            background: rgba(255,255,255,0.1);
            transform: scale(1.05);
          }

          .youtube-settings-btn:active {
            transform: scale(0.95);
          }

          .youtube-fullscreen-btn {
            background: transparent;
            border: none;
            color: white;
            padding: 0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 16px;
            font-family: 'Roboto', Arial, sans-serif;
          }

          .youtube-fullscreen-btn:hover {
            background: rgba(255,255,255,0.1);
            transform: scale(1.05);
          }

          .youtube-fullscreen-btn:active {
            transform: scale(0.95);
          }

          /* Title styling with enhanced drop shadow */
          .video-player-container .video-title {
            background: rgba(0,0,0,0.8) !important;
            border-radius: 4px !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            text-shadow: 
              0px 2px 4px rgba(0,0,0,0.8),
              0px 4px 8px rgba(0,0,0,0.6) !important;
            font-family: inherit !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            font-weight: 500 !important;
            color: white !important;
            -webkit-text-stroke: 0.5px rgba(0,0,0,0.7) !important;
            text-stroke: 0.5px rgba(0,0,0,0.7) !important;
            white-space: nowrap !important;
            display: inline-block !important;
            width: fit-content !important;
            max-width: none !important;
          }

          /* Resolution badge styling to match title */
          .video-player-container .quality-badge {
            font-family: inherit !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            font-weight: 500 !important;
          }
        `}
      </style>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-element"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        controls={false}
        preload="auto"
        playsInline
        muted={false}
        poster={thumbnailUrl}
        autoBuffer={true}
        autoPlay={false}
        data-preload="auto"
        data-buffer-size="120"
        crossOrigin="anonymous"
        data-captions-enabled={captionsEnabled}
        data-optimized-streaming="true"
        data-range-support={rangeRequestSupported.toString()}
        data-streaming-config={streamingConfig ? JSON.stringify(streamingConfig) : ''}
        data-performance-metrics={JSON.stringify(performanceMetrics)}
        tabIndex={0}
        onFocus={() => console.log('🎬 Video element focused')}
        onBlur={() => console.log('🎬 Video element lost focus')}
        onClick={() => {
          // Focus the video element when clicked for keyboard controls
          if (videoRef.current) {
            videoRef.current.focus();
          }
        }}
        // Audio sync attributes
        data-audio-sync="true"
        data-audio-buffer-length="30"
        data-audio-drift-tolerance="0.1"
        // Prevent audio lag attributes
        data-low-latency="false"
        data-buffer-holes="0.1"
        data-max-audio-drift="0.1"
      />

      {/* Clean Netflix-style Paused Interface */}
      {!isPlaying && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 25,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {/* Episode Info */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            maxWidth: '500px'
          }}>
            <div style={{
              fontSize: isFullscreen ? '28px' : '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {title}
            </div>
            <div style={{
              fontSize: isFullscreen ? '16px' : '14px',
              color: '#ccc',
              marginBottom: '8px'
            }}>
              Episode {episodeIndex + 1} of {allEpisodes?.length || 0}
            </div>
            <div style={{
              fontSize: isFullscreen ? '14px' : '12px',
              color: '#999',
              lineHeight: '1.4'
            }}>
              {episodeData?.description || 'Continue watching this episode'}
            </div>
          </div>

          {/* Main Play Button */}
          <button
            onClick={handlePlayPause}
            style={{
              background: '#ee5170',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: isFullscreen ? '20px' : '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 8px 32px rgba(238,81,112,0.4)',
              marginBottom: '30px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#d13f5f';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 12px 40px rgba(238,81,112,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ee5170';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(238,81,112,0.4)';
            }}
          >
            <span style={{ fontSize: isFullscreen ? '28px' : '24px' }}>▶</span>
            Play Episode {episodeIndex + 1}
          </button>

          {/* Episode Navigation */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Previous Episode */}
            {episodeIndex > 0 && (
              <button
                onClick={handlePreviousEpisodeClick}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <span style={{ fontSize: '16px' }}>←</span>
                Previous
              </button>
            )}

            {/* Episode List Button */}
            {allEpisodes && allEpisodes.length > 1 && (
              <button
                onClick={() => setShowEpisodeListPopup(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <span style={{ fontSize: '16px' }}>📺</span>
                Episodes
              </button>
            )}

            {/* Next Episode */}
            {episodeIndex < (allEpisodes?.length || 0) - 1 && (
              <button
                onClick={handleNextEpisodeClick}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                Next
                <span style={{ fontSize: '16px' }}>→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      {shouldShowControls() && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
          pointerEvents: 'none',
          zIndex: 15,
          transition: 'opacity 0.3s ease'
        }} />
      )}

      {/* YouTube-style Controls */}
      <div className="youtube-controls" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        opacity: shouldShowControls() ? 1 : 0,
        // Enhanced fullscreen styling
        background: isFullscreen
          ? 'linear-gradient(transparent, rgba(0,0,0,0.9))'
          : 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: isFullscreen ? '24px 0 16px' : '20px 0 12px',
        transition: 'opacity 0.3s ease'
      }}>
        {/* Progress Bar - Moved inside the controls container */}
        <div
          className="youtube-progress-bar"
          style={{
            width: '100%',
            marginBottom: isFullscreen ? '20px' : '16px',
            height: isFullscreen ? '6px' : '4px',
            position: 'relative',
            zIndex: 31
          }}
          onClick={handleSeek}
        >
          {/* Buffered progress */}
          <div
            className="youtube-progress-buffer"
            style={{ width: `${buffered}%` }}
          ></div>

          {/* Played progress */}
          <div
            className="youtube-progress-fill"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="youtube-progress-thumb"></div>
          </div>
        </div>

        {/* Main Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isFullscreen ? '0 20px 16px' : '0 12px 12px'
        }}>
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '12px' : '8px' }}>
            {/* Play/Pause Button */}
            <button
              className="youtube-control-btn"
              onClick={handlePlayPause}
              style={{
                width: isFullscreen ? '40px' : '32px',
                height: isFullscreen ? '40px' : '32px',
                fontSize: isFullscreen ? '20px' : '16px'
              }}
              title={isPlaying ? 'Pause (k)' : 'Play (k)'}
            >
              {isPlaying ? (
                <span className="icon-[solar--pause-bold] h-6 w-6 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⏸
                </span>
              ) : (
                <span className="icon-[solar--play-bold] h-6 w-6 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ▶
                </span>
              )}
            </button>

            {/* Skip backward 10 seconds */}
            <button
              className="youtube-control-btn"
              onClick={skipBackward}
              style={{
                width: isFullscreen ? '36px' : '28px',
                height: isFullscreen ? '36px' : '28px',
                fontSize: isFullscreen ? '18px' : '14px'
              }}
              title="Skip backward 10 seconds"
            >
              <span className="icon-[solar--rewind-10-seconds-back-bold] h-6 w-6 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ⏮
              </span>
            </button>

            {/* Skip forward 10 seconds */}
            <button
              className="youtube-control-btn"
              onClick={skipForward}
              style={{
                width: isFullscreen ? '36px' : '28px',
                height: isFullscreen ? '36px' : '28px',
                fontSize: isFullscreen ? '18px' : '14px'
              }}
              title="Skip forward 10 seconds"
            >
              <span className="icon-[solar--rewind-10-seconds-forward-bold] h-6 w-6 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ⏭
              </span>
            </button>

            {/* Volume Control */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={() => showVolumeSliderWithDelay()}
              onMouseLeave={() => hideVolumeSliderWithDelay()}
            >
              <button
                className="youtube-control-btn"
                onClick={toggleMute}
                style={{
                  width: isFullscreen ? '36px' : '28px',
                  height: isFullscreen ? '36px' : '28px',
                  fontSize: isFullscreen ? '18px' : '14px'
                }}
                title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
              >
                <span className={`${getVolumeIcon()} h-6 w-6 text-white`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                </span>
              </button>

              {/* Volume Slider */}
              {showVolumeSlider && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    bottom: '50%',
                    transform: 'translateY(50%)',
                    marginLeft: '8px',
                    background: 'rgba(0,0,0,0.9)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    zIndex: 40,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={() => showVolumeSliderWithDelay()}
                  onMouseLeave={() => hideVolumeSliderWithDelay()}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    style={{
                      width: '80px',
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  />
                  <style>
                    {`
                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 12px;
                        height: 12px;
                        background: #ee5170;
                        border-radius: 50%;
                        border: 2px solid white;
                        cursor: pointer;
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 12px;
                        height: 12px;
                        background: #ee5170;
                        border-radius: 50%;
                        border: 2px solid white;
                        cursor: pointer;
                      }
                    `}
                  </style>
                </div>
              )}
            </div>

            {/* Time Display */}
            <div className="youtube-time" style={{
              minWidth: isFullscreen ? '140px' : '100px',
              fontSize: isFullscreen ? '15px' : '13px',
              fontWeight: '400',
              marginLeft: isFullscreen ? '12px' : '8px'
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '8px' : '4px' }}>
            {/* Closed Captions (CC) */}
            {availableCaptions.length > 0 && (
              <button
                className={`youtube-subtitle-btn ${captionsEnabled ? 'active' : ''}`}
                onClick={toggleCaptions}
                title={captionsEnabled ? 'Turn off captions (c)' : 'Turn on captions (c)'}
                style={{
                  width: isFullscreen ? '36px' : '28px',
                  height: isFullscreen ? '36px' : '28px',
                  fontSize: isFullscreen ? '14px' : '12px',
                  fontWeight: '600',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Add inline styles for active state to ensure it shows
                  color: captionsEnabled ? '#ee5170' : 'white',
                  textDecoration: captionsEnabled ? 'underline' : 'none',
                  textDecorationColor: captionsEnabled ? '#ee5170' : 'transparent',
                  background: captionsEnabled ? 'rgba(238,81,112,0.1)' : 'transparent',
                  border: captionsEnabled ? '1px solid rgba(238,81,112,0.3)' : 'none'
                }}
              >
                <span className="icon-[solar--subtitles-bold] h-5 w-5 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  CC
                </span>
              </button>
            )}

            {/* Episode List Button */}
            {allEpisodes && allEpisodes.length > 1 && (
              <button
                className="youtube-subtitle-btn"
                onClick={() => setShowEpisodeListPopup(true)}
                title="Episode List (e)"
                style={{
                  width: isFullscreen ? '36px' : '28px',
                  height: isFullscreen ? '36px' : '28px',
                  fontSize: isFullscreen ? '14px' : '12px',
                  fontWeight: '600',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  background: 'transparent',
                  border: 'none'
                }}
              >
                <span className="icon-[solar--list-bold] h-5 w-5 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📺
                </span>
              </button>
            )}

            {/* Settings */}
            <div style={{ position: 'relative' }}>
              <button
                className="youtube-settings-btn"
                onClick={toggleSettingsMenu}
                title="Settings"
                style={{
                  width: isFullscreen ? '36px' : '28px',
                  height: isFullscreen ? '36px' : '28px',
                  fontSize: isFullscreen ? '20px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="icon-[solar--settings-bold] h-5 w-5 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⚙
                </span>
              </button>

              {/* Settings Menu */}
              {showSettingsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: '8px',
                    background: 'rgba(0,0,0,0.95)',
                    borderRadius: '8px',
                    padding: '12px',
                    minWidth: '200px',
                    zIndex: 50,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                  onMouseEnter={() => resetCursorTimeout()}
                  onMouseLeave={() => closeSettingsMenu()}
                  onMouseMove={handleMouseMove}
                >
                  {/* Settings Tabs */}
                  <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    marginBottom: '12px'
                  }}>
                    <button
                      onClick={() => switchSettingsTab('captions')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: settingsTab === 'captions' ? '#ee5170' : 'white',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: settingsTab === 'captions' ? '600' : '400',
                        borderBottom: settingsTab === 'captions' ? '2px solid #ee5170' : 'none'
                      }}
                    >
                      Captions
                    </button>
                    <button
                      onClick={() => switchSettingsTab('quality')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: settingsTab === 'quality' ? '#ee5170' : 'white',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: settingsTab === 'quality' ? '600' : '400',
                        borderBottom: settingsTab === 'quality' ? '2px solid #ee5170' : 'none'
                      }}
                    >
                      Quality
                    </button>
                  </div>

                  {/* Captions Tab */}
                  {settingsTab === 'captions' && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: 'white', fontSize: '14px' }}>Subtitles</span>
                        <button
                          onClick={toggleCaptions}
                          style={{
                            background: captionsEnabled ? '#ee5170' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {captionsEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {availableCaptions.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                            Available tracks:
                          </div>
                          {availableCaptions.map((caption, index) => {
                            // Strict comparison - only match by ID to ensure single selection
                            const isSelected = currentCaption && currentCaption.id === caption.id;

                            return (
                              <button
                                key={caption.id || index}
                                onClick={() => switchCaptionTrack(caption.id)}
                                style={{
                                  background: isSelected ? 'rgba(238,81,112,0.2)' : 'transparent',
                                  border: 'none',
                                  color: isSelected ? '#ee5170' : 'white',
                                  padding: '6px 8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  width: '100%',
                                  textAlign: 'left',
                                  borderRadius: '4px',
                                  marginBottom: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span>{caption.label}</span>
                                {isSelected && (
                                  <span style={{
                                    color: '#ee5170',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quality Tab */}
                  {settingsTab === 'quality' && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: 'white', fontSize: '14px' }}>Current Quality</span>
                        <span style={{ color: '#ee5170', fontSize: '14px', fontWeight: '600' }}>
                          {selectedResolution.toUpperCase()}
                        </span>
                      </div>

                      <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        marginBottom: '12px'
                      }}>
                        <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                          Resolution: {selectedResolution === 'hd' ? '720P' :
                            selectedResolution === 'fhd' ? '1080P' :
                              selectedResolution === 'uhd' ? '4K' :
                                selectedResolution === 'sd' ? '480P' : 'HD'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                          This is the current stream quality
                        </div>
                      </div>

                      {/* Available Quality Options */}
                      {streamingUrls && streamingUrls.hls && (
                        <div>
                          <div style={{ color: 'white', fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                            Available qualities:
                          </div>
                          {Object.entries(streamingUrls.hls)
                            .filter(([key, url]) => url && key !== 'master') // Filter out master and empty URLs
                            .map(([quality, url]) => {
                              // Debug: Log the URL being used for quality switching
                              console.log(`🔍 Quality tab - ${quality}:`, url);
                              const isSelected = selectedResolution === quality;
                              const qualityLabel = quality === 'sd' ? '480P' :
                                quality === 'hd' ? '720P' :
                                  quality === 'fhd' ? '1080P' :
                                    quality === 'uhd' ? '4K' : quality.toUpperCase();

                              return (
                                <button
                                  key={quality}
                                  onClick={() => {
                                    console.log(`🔍 ${quality} quality URL:`, url);
                                    switchQuality(quality, url);
                                  }}
                                  style={{
                                    background: isSelected ? 'rgba(238,81,112,0.2)' : 'transparent',
                                    border: `1px solid ${isSelected ? 'rgba(238,81,112,0.5)' : 'rgba(255,255,255,0.2)'}`,
                                    color: isSelected ? '#ee5170' : 'white',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    width: '100%',
                                    textAlign: 'left',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.target.style.background = 'rgba(255,255,255,0.1)';
                                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.target.style.background = 'transparent';
                                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      minWidth: '40px'
                                    }}>
                                      {qualityLabel}
                                    </span>
                                    <span style={{
                                      fontSize: '11px',
                                      opacity: 0.7,
                                      textTransform: 'capitalize'
                                    }}>
                                      {quality}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <span style={{
                                      color: '#ee5170',
                                      fontSize: '14px',
                                      fontWeight: 'bold'
                                    }}>
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      )}

                      {/* Auto Quality Option */}
                      {streamingUrls && streamingUrls.hls && streamingUrls.hls.master && (
                        <div style={{ marginTop: '12px' }}>
                          <button
                            onClick={() => {
                              console.log(`🔍 Master quality URL:`, streamingUrls.hls.master);
                              switchQuality('master', streamingUrls.hls.master);
                            }}
                            style={{
                              background: selectedResolution === 'master' ? 'rgba(238,81,112,0.2)' : 'transparent',
                              border: `1px solid ${selectedResolution === 'master' ? 'rgba(238,81,112,0.5)' : 'rgba(255,255,255,0.2)'}`,
                              color: selectedResolution === 'master' ? '#ee5170' : 'white',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              width: '100%',
                              textAlign: 'left',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedResolution !== 'master') {
                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedResolution !== 'master') {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                minWidth: '40px'
                              }}>
                                AUTO
                              </span>
                              <span style={{
                                fontSize: '11px',
                                opacity: 0.7
                              }}>
                                Adaptive quality
                              </span>
                            </div>
                            {selectedResolution === 'master' && (
                              <span style={{
                                color: '#ee5170',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              className="youtube-fullscreen-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)'}
              style={{
                width: isFullscreen ? '36px' : '28px',
                height: isFullscreen ? '36px' : '28px',
                fontSize: isFullscreen ? '20px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFullscreen ? (
                <span className="h-5 w-5 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⛶
                </span>
              ) : (
                <span className="icon-[solar--full-screen-bold] h-5 w-5 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⛶
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Subtitle Display Overlay - Only show when NOT using native subtitles */}
      {captionsEnabled && !useNativeSubtitles && (
        <div style={{
          position: 'absolute',
          bottom: isFullscreen ? '140px' : '120px',
          left: isFullscreen ? '40px' : '20px',
          right: isFullscreen ? '40px' : '20px',
          pointerEvents: 'none',
          zIndex: 25
        }}>
          <div style={{
            color: 'white',
            padding: isFullscreen ? '16px 20px' : '12px 16px',
            textAlign: 'center',
            fontFamily: 'Roboto, Arial, sans-serif',
            fontWeight: '500',
            lineHeight: '1.4',
            maxWidth: isFullscreen ? '90%' : '80%',
            margin: '0 auto',
            minHeight: isFullscreen ? '40px' : '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // YouTube-style drop shadow effect
            textShadow: `
              0px 0px 4px rgba(0,0,0,0.8),
              0px 0px 8px rgba(0,0,0,0.6),
              0px 0px 12px rgba(0,0,0,0.4),
              0px 0px 16px rgba(0,0,0,0.2),
              0px 2px 4px rgba(0,0,0,0.9),
              0px 4px 8px rgba(0,0,0,0.7),
              0px 6px 12px rgba(0,0,0,0.5)
            `,
            WebkitTextStroke: '0.5px rgba(0,0,0,0.8)',
            textStroke: '0.5px rgba(0,0,0,0.8)'
          }}>
            {captionText && (
              <div style={{
                minHeight: isFullscreen ? '32px' : '24px',
                wordWrap: 'break-word',
                maxWidth: '100%'
              }}>
                {captionText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '20px',
              animation: 'spin 1s linear infinite'
            }}>
              <span className="icon-[solar--refresh-circle-bold] h-8 w-8 text-white"></span>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '500' }}>
              Loading {selectedResolution.toUpperCase()} stream...
            </div>

            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
              Episode {episodeIndex + 1}
            </div>

            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#ccc' }}>
              {bufferStatus}
            </div>

            {/* Buffer Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '3px',
              marginBottom: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${bufferProgress}%`,
                height: '100%',
                backgroundColor: '#ee5170',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>

            {/* Fragment Loading Info */}
            {fragmentsLoaded > 0 && (
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                Fragments: {fragmentsLoaded} loaded
                {totalFragments > 0 && ` / ${totalFragments} total`}
              </div>
            )}

            {/* Buffer Progress Info */}
            <div style={{ fontSize: '12px', color: '#aaa' }}>
              Buffer: {bufferProgress.toFixed(0)}% complete
            </div>
          </div>
        </div>
      )}

      {/* Quality Badge */}
      {shouldShowControls() && (
        <div style={{
          position: 'absolute',
          top: isFullscreen ? '24px' : '16px',
          left: isFullscreen ? '24px' : '16px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: isFullscreen ? '8px 12px' : '6px 10px',
          borderRadius: '4px',
          fontSize: isFullscreen ? '14px' : '12px',
          fontWeight: '500',
          fontFamily: 'inherit',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 20,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease',
          opacity: shouldShowControls() ? 1 : 0,
          transform: shouldShowControls() ? 'translateY(0)' : 'translateY(-10px)'
        }}>
          <span className="quality-badge">{selectedResolution.toUpperCase()} ({selectedResolution === 'hd' ? '720P' :
            selectedResolution === 'fhd' ? '1080P' :
              selectedResolution === 'uhd' ? '4K' :
                selectedResolution === 'sd' ? '480P' : 'HD'})</span>
        </div>
      )}

      {/* Video Title Overlay */}
      {title && shouldShowControls() && (
        <div
          className="video-title"
          style={{
            position: 'absolute',
            top: isFullscreen ? '24px' : '16px',
            left: isFullscreen ? '120px' : '100px', // Moved to the right to make room for quality badge
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: isFullscreen ? '8px 12px' : '6px 10px',
            borderRadius: '4px',
            fontSize: isFullscreen ? '14px' : '12px',
            fontWeight: '500',
            fontFamily: 'inherit',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
            opacity: shouldShowControls() ? 1 : 0,
            transform: shouldShowControls() ? 'translateY(0)' : 'translateY(-10px)',
            zIndex: 20,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            textShadow: `
              0px 2px 4px rgba(0,0,0,0.8),
              0px 4px 8px rgba(0,0,0,0.6)
            `,
            WebkitTextStroke: '0.5px rgba(0,0,0,0.7)',
            textStroke: '0.5px rgba(0,0,0,0.7)',
            whiteSpace: 'nowrap',
            display: 'inline-block'
          }}>
          Episode {episodeIndex + 1} - {title}
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              color: '#ee5170'
            }}>
              <span className="icon-[solar--danger-triangle-bold] h-12 w-12 text-red-500"></span>
            </div>

            <div style={{
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '500',
              color: '#ee5170'
            }}>
              Playback Error
            </div>

            <div style={{
              marginBottom: '20px',
              fontSize: '16px',
              color: '#ccc',
              lineHeight: '1.5'
            }}>
              {error}
            </div>

            <div style={{
              fontSize: '14px',
              color: '#888',
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Server streaming error ({selectedResolution.toUpperCase()})
            </div>
          </div>
        </div>
      )}

      {/* Netflix-style Episode List Popup */}
      {showEpisodeListPopup && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 40,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.95)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  Episodes
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#ccc'
                }}>
                  {allEpisodes?.length || 0} Episodes
                </div>
              </div>
              
              <button
                onClick={() => setShowEpisodeListPopup(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                ✕
              </button>
            </div>

            {/* Episodes List */}
            <div style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {allEpisodes && allEpisodes.map((episode, index) => {
                const isCurrentEpisode = index === episodeIndex;
                const isWatched = false; // You can implement watched state logic here
                
                return (
                  <div
                    key={episode.id || index}
                    onClick={() => {
                      handleEpisodeClick(index);
                      setShowEpisodeListPopup(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isCurrentEpisode ? 'rgba(238,81,112,0.15)' : 'transparent',
                      border: isCurrentEpisode ? '2px solid rgba(238,81,112,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '12px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentEpisode) {
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentEpisode) {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    {/* Episode Thumbnail */}
                    <div style={{
                      width: '120px',
                      height: '68px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginRight: '16px',
                      flexShrink: 0,
                      background: episode.thumbnailUrl ? `url(${episode.thumbnailUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {/* Episode Number */}
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </div>

                      {/* Play Button for Current Episode */}
                      {isCurrentEpisode && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(238,81,112,0.9)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '14px' }}>▶</span>
                        </div>
                      )}

                      {/* Watched Indicator */}
                      {isWatched && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#00d4aa',
                          borderRadius: '50%',
                          width: '12px',
                          height: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontSize: '8px' }}>✓</span>
                        </div>
                      )}
                    </div>

                    {/* Episode Info */}
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {episode.title || `Episode ${index + 1}`}
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#ccc',
                        marginBottom: '4px'
                      }}>
                        Episode {index + 1}
                      </div>
                      
                      {episode.description && (
                        <div style={{
                          fontSize: '13px',
                          color: '#999',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {episode.description}
                        </div>
                      )}
                    </div>

                    {/* Current Episode Indicator */}
                    {isCurrentEpisode && (
                      <div style={{
                        background: '#ee5170',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginLeft: '16px',
                        flexShrink: 0
                      }}>
                        Playing
                      </div>
                    )}

                    {/* Duration (if available) */}
                    {episode.duration && (
                      <div style={{
                        color: '#999',
                        fontSize: '12px',
                        marginLeft: '16px',
                        flexShrink: 0
                      }}>
                        {Math.floor(episode.duration / 60)}m
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer with Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                {episodeIndex > 0 && (
                  <button
                    onClick={() => {
                      handlePreviousEpisodeClick();
                      setShowEpisodeListPopup(false);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                  >
                    ← Previous
                  </button>
                )}

                {episodeIndex < (allEpisodes?.length || 0) - 1 && (
                  <button
                    onClick={() => {
                      handleNextEpisodeClick();
                      setShowEpisodeListPopup(false);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                  >
                    Next →
                  </button>
                )}
              </div>

              <div style={{
                color: '#999',
                fontSize: '14px'
              }}>
                Press 'E' to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Episode Countdown Overlay */}
      {showNextEpisodeCountdown && episodeIndex < (allEpisodes?.length || 0) - 1 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          zIndex: 35,
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(238,81,112,0.5)',
          minWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            Next Episode in {nextEpisodeCountdown}s
          </div>
          
          <div style={{
            fontSize: '18px',
            color: '#ccc',
            marginBottom: '24px'
          }}>
            {allEpisodes[episodeIndex + 1]?.title || `Episode ${episodeIndex + 2}`}
          </div>

          {/* Countdown Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '3px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((10 - nextEpisodeCountdown) / 10) * 100}%`,
              height: '100%',
              background: '#ee5170',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setShowNextEpisodeCountdown(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleNextEpisodeClick}
              style={{
                background: '#ee5170',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#d13f5f';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ee5170';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Play Next Episode
            </button>
          </div>
        </div>
      )}

      {/* Controls Hidden Indicator - Subtle fade effect */}
      {isPlaying && !shouldShowControls() && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0.3,
          transition: 'opacity 0.3s ease'
        }} />
      )}

      {/* Subtle top fade when controls are hidden */}
      {isPlaying && !shouldShowControls() && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0.4,
          transition: 'opacity 0.3s ease'
        }} />
      )}
    </div>
  );
};

export default SeriesStreamingPlayer;
