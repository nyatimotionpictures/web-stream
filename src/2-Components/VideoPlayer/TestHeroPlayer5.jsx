import React, { useEffect, useRef, useState, useCallback } from 'react';
import apiRequest from '../../3-Middleware/apiRequest';
import { useNetworkState } from "../../2-Components/hooks/useNetworkState"

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

const TestServerStreamingPlayer = ({
  videoUrl,
  hlsUrl,
  resourceId,
  type = 'hd', // Default to HD instead of SD
  thumbnailUrl,
  title,
  controls = true,
  autoPlay = true,
  onEnded,
  showControls,
  onLoaded,
  onPlay,
  onPause,
  muted,
  isVisible = true,
  width = '100%',
  height = '100%',
  aspectRatio = '16/9',
  isTrailer = false // Add explicit trailer prop
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  // const hlsLoadStartedRef = useRef(false);
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
  const [isMuted, setIsMuted] = useState(!!muted);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderTimeoutRef = useRef(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState(isTrailer ? 'quality' : 'captions'); // 'captions' or 'quality' - default to quality for trailers
  const [isSeeking, setIsSeeking] = useState(false);
  // const [seekPreviewTime, setSeekPreviewTime] = useState(0);
  // const [showSeekPreview, setShowSeekPreview] = useState(false);
  // const [bufferStartTime, setBufferStartTime] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [bufferStatus, setBufferStatus] = useState('Initializing...');
  const [showBufferLoader, setShowBufferLoader] = useState(false);
  const [isBuildingBuffer, setIsBuildingBuffer] = useState(false);
  const [bufferBuildProgress, setBufferBuildProgress] = useState(0);
  const [bufferBuildTarget, setBufferBuildTarget] = useState(0);

  // Inside your component, add network state monitoring
  const { isOnline, networkQuality } = useNetworkState();


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
  // const generateUniqueTrackId = (baseId, language) => {
  //   const timestamp = Date.now();
  //   const randomSuffix = Math.random().toString(36).substr(2, 9);
  //   return baseId || `track-${language || 'unknown'}-${timestamp}-${randomSuffix}`;
  // };

  // Auto-hide cursor and controls timeout
  const cursorTimeoutRef = useRef(null);
  const CURSOR_HIDE_DELAY = 3000; // 3 seconds of inactivity before hiding

  const bufferBuildIntervalRef = useRef(null);
  const bufferMonitorRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const lastBufferCheckRef = useRef(0);



  // Pre-load subtitles when video starts loading
  useEffect(() => {
    if (streamingUrl && !isTrailer) {

      // Clear existing subtitles
    setAvailableCaptions([]);
    setCurrentCaption(null);
    setCaptionsEnabled(false);

    // Remove any existing tracks from video element
    const video = videoRef.current;
    if (video) {
      const existingTracks = Array.from(video.querySelectorAll('track'));
      existingTracks.forEach(track => track.remove());
    }

      // Pre-load subtitles in background
      loadSubtitlesFromServer(resourceId, selectedResolution)
        .catch(error => {
          console.log('Subtitle pre-load failed (non-critical):', error.message);
        });
    }
  }, [streamingUrl, resourceId, selectedResolution, isTrailer]);

  // Use it when you get available subtitles
  useEffect(() => {
    if (availableCaptions.length > 0) {
      preLoadSubtitleTracks(availableCaptions);
    }
  }, [availableCaptions]);

  // Load subtitles from server
  const loadSubtitlesFromServer = async (resourceId, resolution) => {
    console.log(`📝 loadSubtitlesFromServer called - isTrailer: ${isTrailer}, resourceId: ${resourceId}, resolution: ${resolution}`);

    if (isTrailer) {
      console.log('🎬 Skipping subtitle loading for trailer');
      return;
    }

    try {
      console.log(`📝 Loading subtitles from server for ${resolution.toUpperCase()}...`);

      // Use the new subtitle endpoint to get available subtitles from database
      const response = await apiRequest.get(`/v1/streaming/subtitles/${resourceId}`, {
        timeout: 5000 //Shorter timeout for subtitles
      });
      const data = response.data;

      if (data.success && data.subtitles.length > 0) {
        console.log(`📝 Found ${data.subtitles.length} subtitles in database:`, data.subtitles);

        // Transform database subtitle records to video track format
        const loadedSubtitles = data.subtitles.map((subtitle, index) => {
          return {
            id: subtitle.id,
            label: subtitle.label || `${subtitle.languageName} (${subtitle.language.toUpperCase()})`,
            language: subtitle.language,
            kind: 'subtitles',
            src: subtitle.url, // Use S3 URL directly from database
            filename: subtitle.filename,
            size: subtitle.size,
            createdAt: subtitle.createdAt
          };
        });

        setAvailableCaptions(loadedSubtitles);
        console.log(`📝 Transformed ${loadedSubtitles.length} subtitle records to video tracks:`, loadedSubtitles);

        // Actually load the subtitle tracks into the video element
        // await loadSubtitleTracksToVideo(loadedSubtitles);
        // REMOVED: await loadSubtitleTracksToVideo(loadedSubtitles);
        // The useEffect on [availableCaptions] will now handle pre-loading

        return loadedSubtitles; // Return for potential use elsewhere
      } else {
        console.log(`⚠️ No subtitles found in database for ${resolution.toUpperCase()}`);
        if (data.message) {
          console.log(`📝 Server message: ${data.message}`);
        }
        setAvailableCaptions([]); // Ensure empty state
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading subtitles from server:', error);

      // Schedule retry after 5 seconds
      setTimeout(() => {
        loadSubtitlesFromServer(resourceId, resolution).catch(console.error);
      }, 5000);

      throw error; // Re-throw for caller to handle
    }
  };


  // Add this function to pre-load subtitles before they're needed
  const preLoadSubtitleTracks = async (subtitles) => {
    if (!subtitles || subtitles.length === 0) return;

    console.log('📝 Pre-loading subtitle tracks...');

    // Pre-fetch all subtitle files to warm up browser cache
    const preFetchPromises = subtitles.map(async (subtitle) => {
      try {
        // Use fetch with cache: 'force-cache' to warm up browser cache
        await fetch(subtitle.src, {
          method: 'HEAD', // Just get headers, not full content
          cache: 'force-cache',
          mode: 'cors',
          headers: {
            'Range': 'bytes=0-1000' // Pre-load just the first KB for instant availability
          }
        });
        console.log(`✅ Pre-loaded: ${subtitle.label}`);
      } catch (error) {
        console.warn(`⚠️ Pre-load failed: ${subtitle.label}`, error.message);
      }
    });

    await Promise.allSettled(preFetchPromises);
    console.log('✅ All subtitle tracks pre-loaded');
  };


  // Load subtitle tracks into the video element - OPTIMIZED VERSION
  const loadSubtitleTracksToVideo = async (subtitles) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      console.log('📝 Loading subtitle tracks into video element...');

      // Remove any existing tracks first
      const existingTracks = Array.from(video.querySelectorAll('track'));
      existingTracks.forEach(track => track.remove());

      // Load tracks in PARALLEL with proper event listeners
      const trackLoadPromises = subtitles.map((subtitle) => {
        return new Promise((resolve) => {
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
          track.default = isEnglish;

          // Add event listeners for load/error
          const onLoad = () => {
            console.log(`✅ Subtitle track loaded: ${subtitle.label}`);
            track.removeEventListener('load', onLoad);
            track.removeEventListener('error', onError);
            resolve({ track, success: true, subtitle });
          };

          const onError = () => {
            console.warn(`⚠️ Subtitle track failed: ${subtitle.label}`);
            track.removeEventListener('load', onLoad);
            track.removeEventListener('error', onError);
            resolve({ track, success: false, subtitle });
          };

          track.addEventListener('load', onLoad);
          track.addEventListener('error', onError);

          // Set timeout for track loading (8 seconds max)
          setTimeout(() => {
            if (!track.readyState) {
              console.warn(`⏰ Subtitle track timeout: ${subtitle.label}`);
              resolve({ track, success: false, subtitle });
            }
          }, 8000);

          // Add the track to the video
          video.appendChild(track);
        });
      });

      // Wait for ALL tracks to either load or fail
      const results = await Promise.all(trackLoadPromises);

      // Separate successful and failed tracks
      const successfulTracks = results.filter(result => result.success);
      const failedTracks = results.filter(result => !result.success);

      console.log(`📊 Subtitle loading complete: ${successfulTracks.length} succeeded, ${failedTracks.length} failed`);

      if (successfulTracks.length > 0) {
        const tracks = Array.from(video.textTracks);
        const updatedCaptions = tracks.map(track => ({
          id: track.id,
          label: track.label || track.language || `Track ${track.language}`,
          language: track.language,
          kind: track.kind
        }));

        setAvailableCaptions(updatedCaptions);

        // Find and activate the appropriate track
        let trackToActivate = null;

        // 1. Try to find English track
        const englishTrack = tracks.find(track =>
          track.language && ['en', 'eng', 'english'].includes(track.language.toLowerCase())
        );

        // 2. Try to find default track (marked as default="true")
        const defaultTrack = tracks.find(track => track.default);

        // 3. Use first available track
        trackToActivate = englishTrack || defaultTrack || tracks[0];

        if (trackToActivate) {
          // Hide all tracks first
          tracks.forEach(track => {
            track.mode = 'hidden';
          });

          // Activate the selected track
          trackToActivate.mode = 'showing';

          const captionObject = {
            id: trackToActivate.id,
            label: trackToActivate.label || trackToActivate.language || `Track ${trackToActivate.language}`,
            language: trackToActivate.language,
            kind: trackToActivate.kind
          };

          setCurrentCaption(captionObject);
          setCaptionsEnabled(true);
          setUseNativeSubtitles(true);

          console.log('✅ Activated subtitle track:', captionObject.label);
        }
      } else {
        console.warn('⚠️ No subtitle tracks loaded successfully');
        setAvailableCaptions([]);
        setCurrentCaption(null);
        setCaptionsEnabled(false);
      }

    } catch (error) {
      console.error('❌ Error loading subtitle tracks to video:', error);
      setAvailableCaptions([]);
      setCurrentCaption(null);
      setCaptionsEnabled(false);
    }
  };

  // 6. Manual subtitle activation (when user clicks CC button)
  const activateSubtitles = async () => {
    if (availableCaptions.length > 0) {
      console.log('🎬 Activating subtitles...');
      await loadSubtitleTracksToVideo(availableCaptions);
      setCaptionsEnabled(true);
      setUseNativeSubtitles(true);
    }
  };


  const toggleCaptions = () => {
    console.log('🎬 toggleCaptions called - Current state:', {
      isTrailer,
      captionsEnabled,
      availableCaptions: availableCaptions.length,
      currentCaption
    });

    // Don't allow caption toggling for trailers
    if (isTrailer) {
      console.log('🎬 Captions disabled for trailers');
      return;
    }

    const video = videoRef.current;
    if (!video) {
      console.error('❌ No video element found');
      return;
    }

    const tracks = Array.from(video.textTracks || []);
    console.log('📝 Available text tracks:', tracks.map(t => ({ id: t.id, label: t.label, mode: t.mode })));

    const newState = !captionsEnabled;
    console.log(`🔄 Toggling captions: ${captionsEnabled} -> ${newState}`);

    // Update state immediately for UI responsiveness
    setCaptionsEnabled(newState);

    if (newState) {
      console.log('✅ Enabling captions...');

      // Use native browser subtitles
      setUseNativeSubtitles(true);
      setCaptionText(''); // Clear custom overlay text

      if (tracks.length > 0) {
        // We have tracks already loaded - enable them
        enableExistingTracks(tracks);
      } else if (availableCaptions.length > 0) {
        // We have subtitle metadata but tracks aren't loaded yet
        console.log('📝 Loading subtitle tracks on demand...');
        loadSubtitleTracksToVideo(availableCaptions)
          .then(() => {
            // After tracks are loaded, enable them
            const updatedTracks = Array.from(video.textTracks || []);
            if (updatedTracks.length > 0) {
              enableExistingTracks(updatedTracks);
            }
          })
          .catch(error => {
            console.error('❌ Failed to load subtitle tracks:', error);
            setCaptionsEnabled(false); // Revert state on error
          });
      } else {
        // No subtitles available at all
        console.log('ℹ️ No subtitles available to enable');
        setCaptionsEnabled(false); // Revert state

        // Try to load subtitles from server
        loadSubtitlesFromServer(resourceId, selectedResolution)
          .then(loadedSubtitles => {
            if (loadedSubtitles.length > 0) {
              console.log('📝 Subtitles loaded, enabling...');
              setCaptionsEnabled(true); // Set back to true
            }
          })
          .catch(console.error);
      }
    } else {
      console.log('✅ Disabling captions...');
      // Disable captions
      setUseNativeSubtitles(false);
      setCaptionText('');

      // Hide all tracks but don't clear currentCaption (for next enable)
      tracks.forEach(track => {
        track.mode = 'hidden';
        console.log(`📝 Hiding track: ${track.label || track.id}`);
      });

      console.log('✅ Disabled all captions');
    }

    resetCursorTimeout();
    console.log('🎬 toggleCaptions completed - New state:', { captionsEnabled: newState });
  };

  // Helper function to enable existing tracks
  const enableExistingTracks = (tracks) => {
    const video = videoRef.current;
    if (!video) return;

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
      setCaptionsEnabled(false); // Revert state if no tracks found
    }
  };


  // Cleanup all intervals and timeouts
  const cleanupIntervals = useCallback(() => {
    if (bufferBuildIntervalRef.current) {
      clearInterval(bufferBuildIntervalRef.current);
      bufferBuildIntervalRef.current = null;
    }

    
    // if (bufferMonitorRef.current) {
    //   clearInterval(bufferMonitorRef.current);
    //   bufferMonitorRef.current = null;
    // }
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
      cursorTimeoutRef.current = null;
    }
  }, []);

  // Buffer building function
  const buildBuffer = useCallback((targetBufferSeconds = 10) => {
    const video = videoRef.current;
    if (!video || isBuildingBuffer) return;

    setIsBuildingBuffer(true);
    setBufferBuildTarget(targetBufferSeconds);
    setBufferBuildProgress(0);
    setBufferStatus(`Building buffer... 0%`);

    console.log(`🔄 Building buffer to ${targetBufferSeconds} seconds`);

    cleanupIntervals();

    const checkBuffer = () => {
      if (!video.buffered.length) {
        setBufferBuildProgress(0);
      return;
      };

      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const currentTime = video.currentTime || 0;
      const bufferAhead = bufferedEnd - currentTime;

      const progress = Math.min((bufferAhead / targetBufferSeconds) * 100, 100);
      setBufferBuildProgress(progress);
      setBufferStatus(`Building buffer... ${Math.round(progress)}%`);

      if (bufferAhead >= targetBufferSeconds) {
        setIsBuildingBuffer(false);
        setBufferStatus('Ready');
        // setShowBufferLoader(false);
        cleanupIntervals();
        console.log(`✅ Buffer built to ${bufferAhead.toFixed(1)} seconds`);
      }
    };

    bufferBuildIntervalRef.current = setInterval(checkBuffer, 100);

    // Safety timeout
    setTimeout(() => {
      if (isBuildingBuffer) {
        console.log('⏰ Buffer build timeout');
        setIsBuildingBuffer(false);
        setBufferStatus('Ready');
        cleanupIntervals();
      }
    }, 30000);
  }, [isBuildingBuffer, cleanupIntervals]);

  // Check if we need to show buffer loader
  const checkBufferState = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const currentTime = video.currentTime || 0;
    const bufferAhead = bufferedEnd - currentTime;

    setBufferStatus(`${bufferAhead.toFixed(1)}s buffered`);

    // Only show buffer loader if we're actually waiting for new data
    // const now = Date.now();
    // const shouldShowLoader = bufferAhead < 1 && isPlaying && !video.paused;

     // Only for non-HLS progress tracking
  if (!isHLS && duration > 0) {
    const progress = (bufferedEnd / duration) * 100;
    setBufferProgress(progress);
  }

    // Show buffer loader when buffer is low and video is playing
    const shouldShowLoader = bufferAhead < 2 && isPlaying && !video.paused;

    // if (shouldShowLoader && now - lastBufferCheckRef.current > 500) {
    //   setShowBufferLoader(true);
    //   lastBufferCheckRef.current = now;
    // } else if (bufferAhead >= 2 && showBufferLoader) {
    //   setShowBufferLoader(false);
    // }

    if (shouldShowLoader) {
      setShowBufferLoader(true);
      lastBufferCheckRef.current = Date.now();
    } else if (bufferAhead >= 4 && showBufferLoader) {
      setShowBufferLoader(false);
    }


    // Auto-pause if buffer is critically low
    // if (bufferAhead < 0.5 && isPlaying && !video.paused) {
    //   console.log('⏸️ Pausing due to critically low buffer');
    //   wasPlayingRef.current = true;
    //   video.pause();
    //   startBufferBuilding(10);
    // }

    // Proactive buffering: Start building buffer before it gets critical
    if (bufferAhead < 5 && isPlaying && !isBuildingBuffer && !video.paused) {
      console.log('🔄 Low buffer detected, starting pre-buffering');
      buildBuffer(10); // Build 10 seconds of buffer
    }

    // Auto-resume if sufficient buffer exists and was playing
    // if (bufferAhead >= 3 && !isPlaying && video.paused && wasPlayingRef.current) {
    //   console.log('▶️ Resuming playback - sufficient buffer');
    //   wasPlayingRef.current = false;
    //   video.play().catch(console.error);
    // }

    // Emergency pause only if buffer is completely exhausted
    if (bufferAhead < 0.2 && isPlaying && !video.paused) {
      console.log('⏸️ Emergency pause - buffer exhausted');
      video.pause();
      buildBuffer(5); // Build minimum 5s buffer
    }

    // Auto-resume with better conditions
    if (bufferAhead >= 4 && !isPlaying && video.paused && networkQuality !== 'poor') {
      console.log('▶️ Resuming playback - sufficient buffer');
      video.play().catch(err => {
        console.error('Playback resume failed:', err);
      });
    }
  }, [isPlaying, isBuildingBuffer, networkQuality, buildBuffer, isHLS, duration]);

  

  // Auto-hide cursor functionality
  const resetCursorTimeout = useCallback(() => {
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
  }, [isPlaying, isFullscreen, isHovering]);

  const clearCursorTimeout = useCallback(() => {
    if (cursorTimeoutRef.current) {
      console.log('🖱️ clearCursorTimeout called - clearing timeout');
      clearTimeout(cursorTimeoutRef.current);
      cursorTimeoutRef.current = null;
    }
  }, []);

  // Add this useEffect to reset seeking state
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handleSeeked = () => {
    setIsSeeking(false);
  };

  video.addEventListener('seeked', handleSeeked);
  
  return () => {
    video.removeEventListener('seeked', handleSeeked);
  };
}, []);

  // Enhanced auto-hide controls functionality
  const shouldShowControls = useCallback(() => {
    // Always show controls when:
    // 1. Video is paused
    // 2. User is hovering AND cursor is visible (recent activity)
    // 3. Cursor is visible (recent activity) - this covers all recent interactions
    // 4. Settings menu is open
    // 5. Seeking or buffering
    //removed the isBuildingBuffer from here
    const shouldShow = !isPlaying || (isHovering && showCursor) || showCursor || showSettingsMenu || isSeeking || isLoading ;

    // Debug logging for fullscreen mode
    if (isFullscreen) {
      const reason = !isPlaying ? 'video paused' :
        (isHovering && showCursor) ? 'hovering with cursor visible' :
          showCursor ? 'cursor visible (recent activity)' :
            showSettingsMenu ? 'settings menu open' :
              isSeeking ? 'seeking in progress' :
                isLoading ? 'buffering in progress' : 'no reason found';

    }

    return shouldShow;
  }, [isPlaying, isHovering, showCursor, showSettingsMenu, isSeeking, isLoading, isFullscreen, isBuildingBuffer]);

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

  // Enhance your network state hook usage
  useEffect(() => {
    if (!isOnline) {
      console.log('🌐 Offline - pausing playback');
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
      }
      return;
    }

    // When coming back online, rebuild buffer
    if (isOnline && isPlaying) {
      console.log('🌐 Back online - rebuilding buffer');
      buildBuffer(5);
    }
  }, [isOnline, isPlaying]);

  // Add network-aware HLS configuration
  useEffect(() => {
    if (!hlsRef.current || !networkQuality) return;

    // Adjust HLS configuration based on network quality
    const hls = hlsRef.current;

    switch (networkQuality) {
      case 'poor':
        hls.config.maxBufferLength = 60;
        hls.config.maxMaxBufferLength = 90;
        hls.config.abrEwmaDefaultEstimate = 2000000; // 2 Mbps
        break;
      case 'good':
        hls.config.maxBufferLength = 90;
        hls.config.maxMaxBufferLength = 120;
        hls.config.abrEwmaDefaultEstimate = 5000000; // 5 Mbps
        break;
      case 'excellent':
        hls.config.maxBufferLength = 120;
        hls.config.maxMaxBufferLength = 180;
        hls.config.abrEwmaDefaultEstimate = 10000000; // 10 Mbps
        break;
    }
  }, [networkQuality]);

  // Get streaming URL from server with enhanced configuration integration
  useEffect(() => {
    //Added abort controller to handle seeking properly
    const abortController = new AbortController();
    const getStreamingUrl = async () => {
      if (!resourceId) {
        console.error('❌ No resourceId provided for streaming');
        setError('No resource ID provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔗 Getting streaming URL for resource: ${resourceId} (type: ${type})`);

        // Use the existing apiRequest to call the server-side streaming API
        const response = await apiRequest.get(`/v1/streaming/urls/${resourceId}`);
        const data = response.data;

        if (data.success) {
          // Store streaming configuration for optimization
          setStreamingConfig(data.streamingConfig);


          // Determine if this is a trailer request by checking multiple indicators
          const isTrailerRequest = isTrailer || videoUrl?.includes('trailer') || type === 'trailer';

          // Handle trailer URLs if this is a trailer request and trailer URLs exist
          if (isTrailerRequest && data.trailerUrls) {
            // Set trailer streaming URLs
            const trailerHlsUrl = data.trailerUrls.hls?.trailer;

            if (trailerHlsUrl) {
              setStreamingUrls({
                hls: {

                  trailer: trailerHlsUrl, // For backward compatibility
                  hd: trailerHlsUrl // Trailers are HD
                },
                mp4: null // Trailers don't have MP4 fallback
              });
              setCurrentUrl(trailerHlsUrl);
              setStreamingUrl(trailerHlsUrl);
              setIsHLS(true); // Trailers are always HLS
              setSelectedResolution('hd'); // Trailers are always HD

              console.log('✅ Trailer URL set successfully');

              // Skip subtitle loading for trailers as they don't have subtitles
              if (!isTrailer) {
                try {
                  await loadSubtitlesFromServer(resourceId, 'hd');
                } catch (subtitleError) {
                  console.log('ℹ️ No subtitles found for trailer (expected):', subtitleError.message);
                }
              } else {
                console.log('🎬 Skipping subtitle loading for trailer');
              }
            } else {
              console.error('❌ No trailer HLS URL found in response');
              handleStreamingError(new Error('No trailer streaming URL available'), 'trailer_url_missing');
            }
          }
          // Handle regular video URLs if not a trailer request and regular video URLs exist
          else if (!isTrailerRequest && data.streamingUrls) {
            console.log('🎬 Using regular video streaming URLs:', data.streamingUrls);

            // Set regular video streaming URLs
            setStreamingUrls(data.streamingUrls);

            // Select appropriate streaming URL based on type with better fallback logic
            let selectedUrl = null;
            let finalResolution = type?.toLowerCase() || 'hd';

            if (data.streamingUrls.hls) {
              console.log('📋 Available HLS resolutions:', Object.keys(data.streamingUrls.hls));

              switch (type?.toLowerCase()) {
                case 'master':
                case 'auto':
                  selectedUrl = data.streamingUrls.hls.master;
                  finalResolution = 'master';
                  break;
                case 'uhd':
                case '4k':
                  selectedUrl = data.streamingUrls.hls.uhd || data.streamingUrls.hls.fhd || data.streamingUrls.hls.hd || data.streamingUrls.hls.master;
                  finalResolution = selectedUrl === data.streamingUrls.hls.uhd ? 'uhd' :
                    selectedUrl === data.streamingUrls.hls.fhd ? 'fhd' :
                      selectedUrl === data.streamingUrls.hls.hd ? 'hd' : 'master';
                  break;
                case 'fhd':
                case '1080p':
                  selectedUrl = data.streamingUrls.hls.fhd || data.streamingUrls.hls.hd || data.streamingUrls.hls.master;
                  finalResolution = selectedUrl === data.streamingUrls.hls.fhd ? 'fhd' :
                    selectedUrl === data.streamingUrls.hls.hd ? 'hd' : 'master';
                  break;
                case 'hd':
                case '720p':
                  selectedUrl = data.streamingUrls.hls.hd || data.streamingUrls.hls.fhd || data.streamingUrls.hls.master;
                  finalResolution = selectedUrl === data.streamingUrls.hls.hd ? 'hd' :
                    selectedUrl === data.streamingUrls.hls.fhd ? 'fhd' : 'master';
                  break;
                case 'sd':
                case '480p':
                  selectedUrl = data.streamingUrls.hls.sd || data.streamingUrls.hls.hd || data.streamingUrls.hls.master;
                  finalResolution = selectedUrl === data.streamingUrls.hls.sd ? 'sd' :
                    selectedUrl === data.streamingUrls.hls.hd ? 'hd' : 'master';
                  break;
                default:
                  // Better default fallback order: master > hd > fhd > sd
                  selectedUrl = data.streamingUrls.hls.master || data.streamingUrls.hls.hd || data.streamingUrls.hls.fhd || data.streamingUrls.hls.sd;
                  finalResolution = selectedUrl === data.streamingUrls.hls.master ? 'master' :
                    selectedUrl === data.streamingUrls.hls.hd ? 'hd' :
                      selectedUrl === data.streamingUrls.hls.fhd ? 'fhd' : 'sd';
              }
            }

            if (selectedUrl) {
              console.log(`🎬 Selected ${finalResolution.toUpperCase()} URL for type "${type}":`, selectedUrl);
              setCurrentUrl(selectedUrl);
              setStreamingUrl(selectedUrl);
              setIsHLS(selectedUrl?.includes('.m3u8'));
              setSelectedResolution(finalResolution);

              console.log('✅ Regular video URL set successfully');

              // Load subtitles from server for this resource
              try {
                await loadSubtitlesFromServer(resourceId, finalResolution);
              } catch (subtitleError) {
                console.log('ℹ️ No subtitles found for this video:', subtitleError.message);
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
              console.error('📋 Available URLs:', data.streamingUrls);
              handleStreamingError(new Error(`No streaming URL available for ${type}`), 'url_selection_failed');
            }
          }
          // Handle case where neither trailer nor regular videos are available
          else {
            console.error('❌ No suitable streaming URLs found in response');
            console.error('📋 Response data:', {
              hasTrailer: data.hasTrailer,
              hasRegularVideos: data.hasRegularVideos,
              trailerUrls: data.trailerUrls,
              streamingUrls: data.streamingUrls,
              isTrailerRequest
            });
            handleStreamingError(new Error('No streaming URLs available'), 'no_urls_available');
          }
        } else {
          console.error('❌ Streaming URL request failed:', data);
          handleStreamingError(new Error('Failed to get streaming URLs'), 'api_request_failed');
        }
      } catch (error) {
        console.error('❌ Error getting streaming URL:', error);
        if (error.name === 'AbortError') {
          console.log('🔄 URL request aborted (likely due to navigation)');
          return;
        }

        // Fallback to original HLS URL if server-side streaming fails
        if (hlsUrl) {
          console.log('🔄 Falling back to original HLS URL:', hlsUrl);
          setStreamingUrl(hlsUrl);
          setIsHLS(hlsUrl?.includes('.m3u8'));
        } else {
          setError('Failed to get streaming URL');
          setIsLoading(false);
        }
      }
    };

    getStreamingUrl();

    return () => {
      abortController.abort();
    };
  }, [resourceId, type, isTrailer, hlsUrl, videoUrl]); // Add type and isTrailer to dependencies



  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const bufferProgressInterval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.buffered.length > 0 && isLoading) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 1;
        const progress = (bufferedEnd / duration) * 100;
        setBufferProgress(progress);
        setBufferStatus(`Buffering: ${Math.round(progress)}%`);
        
        // Auto-hide when sufficiently buffered
        if (progress > 95) {
          setIsLoading(false);
          setShowBufferLoader(false);
        }
      }
    }, 100);

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      setShowBufferLoader(false); // Hide loader when playing
      setBufferStatus('Ready');
      if (typeof onPlay === 'function') {
        onPlay();
      }
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (typeof onPause === 'function') {
        onPause();
      }
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setShowBufferLoader(false); // Hide loader when can play
      if (typeof onLoaded === 'function') {
        onLoaded();
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setShowBufferLoader(false);
      if (typeof onEnded === 'function') {
        onEnded();
      }
    };
    const handleWaiting = () => {
      // Show loader when video is waiting for data
      setShowBufferLoader(true);
      setBufferStatus('Buffering...');
    };
    const handlePlaying = () => {
      // Hide loader when video starts playing
      setShowBufferLoader(false);
      setBufferStatus('Playing');
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
      setError('Video playback error');
      setIsLoading(false);
      setShowBufferLoader(false);
    };

    //caption event handlers
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
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('cuechange', handleCueChange);
    video.addEventListener('texttrackchange', handleTrackChange);

    // Start buffer monitoring
    // bufferMonitorRef.current = setInterval(checkBufferState, 500);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('cuechange', handleCueChange);
      video.removeEventListener('texttrackchange', handleTrackChange);
      clearInterval(bufferProgressInterval);
      cleanupIntervals();
    };
  }, [checkBufferState, cleanupIntervals]);

  // Respect visibility: pause when not visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isVisible) {
      if (!video.paused) {
        video.pause();
      }
    } else {
      // When visible, attempt to play (user gesture may be required if not muted)
      if (autoPlay) {
        video.play().catch(() => {
          // Ignore autoplay rejection; user interaction may be needed
        });
      }
    }
  }, [isVisible, autoPlay, streamingUrl]);

  // Keep muted in sync with prop changes from parent
  useEffect(() => {
    setIsMuted(!!muted);
    const video = videoRef.current;
    if (video) {
      video.muted = !!muted;
    }
  }, [muted]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      clearCursorTimeout();
      if (volumeSliderTimeoutRef.current) {
        clearTimeout(volumeSliderTimeoutRef.current);
      }
      if (bufferBuildIntervalRef.current) {
        clearInterval(bufferBuildIntervalRef.current);
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
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'escape':
          if (isFullscreen) {
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




  // Enhanced HLS.js configuration with network-aware settings
  // HLS.js Setup - SIMPLIFIED
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamingUrl) return;

    setIsLoading(true);
    setIsPlaying(false);
    setError(null);
    setShowBufferLoader(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setBufferProgress(0);
    setBufferStatus('Initializing...');
    setFragmentsLoaded(0);
    setTotalFragments(0);
    cleanupIntervals();

    const initializeHLS = async () => {
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          // Destroy previous instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
            // hlsRef.current = null;
          }

          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            // buffer
            // Enhanced buffering configuration for continuous streaming
            maxBufferLength: 90, // Increase buffer length for better 

            maxMaxBufferLength: 120, //Maximum buffer length changed from 30 to 120
            maxBufferSize: 60 * 1000 * 1000, // from 30MB to 120 max buffer size
            backBufferLength: 30,

            maxBufferHole: 0.1, // Reduce buffer hole tolerance for smoother playback
            highBufferWatchdogPeriod: 1, // More frequent buffer monitoring
            nudgeOffset: 0.05, // Smaller nudge offset for smoother recovery
            nudgeMaxRetry: 10, // More retries for better recovery
            maxFragLookUpTolerance: 0.1, // Tighter fragment lookup tolerance

            // Fragment loading optimization
            fragLoadingTimeOut: 20000,
            manifestLoadingTimeOut: 20000,
            levelLoadingTimeOut: 20000,

            // Network optimization
            maxLoadingRetry: 6,
            retryDelay: 1000,
            maxRetryDelay: 5000,


            // ABR optimization
            // abrEwmaDefaultEstimate: 5000000, // 5 Mbps default
            // abrEwmaSlowVoD: 3, // Slower ABR for VoD

            // Buffer management
            maxBufferStarvationDelay: 2, // Reduce starvation delay

            // Enhanced caption support for professional subtitle approach
            enableWebVTT: true, // Enable WebVTT captions
            enableIMSC1: true, // Enable IMSC1 captions
            enableCEA708Captions: true, // Enable CEA708 captions
            enableDateRangeMetadataCues: true, // Enable date range metadata for captions
            enableEmsgMetadataCues: !isTrailer, // Disable emsg metadata for trailers

            // Professional subtitle approach: Enhanced subtitle handling for individual resolutions (disabled for trailers)
            subtitleDisplay: !isTrailer, // Disable subtitle display for trailers
            subtitleTrackSelectionMode: isTrailer ? 'none' : 'auto', // No subtitle track selection for trailers
            subtitlePreference: isTrailer ? [] : ['en', 'eng', 'english'], // No subtitle preferences for trailers

            // Individual resolution subtitle support (disabled for trailers)
            enableSubtitleStreaming: !isTrailer, // Disable subtitle streaming for trailers
            subtitleStreamingMode: isTrailer ? 'none' : 'external', // No subtitle streaming mode for trailers

            // Quality and performance settings
            startLevel: -1, // Auto start level

            // Preloading settings
            startFragPrefetch: true, // Prefetch start fragment
          });

          hlsRef.current = hls;
          hls.loadSource(streamingUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ Manifest parsed');
            setIsLoading(false);
            // Start loading fragments immediately
            // hls.startLoad();

            if (data.levels && data.levels.length > 0 && data.levels[0].details) {
              setTotalFragments(data.levels[0].details.totalFragments);
              setFragmentsLoaded(0);
            }
          });

          // hls.on(Hls.Events.BUFFER_APPENDED, () => {
          //   // Hide buffer loader when new data is appended
          //   setShowBufferLoader(false);
          // });

          hls.on(Hls.Events.BUFFER_STALLED, () => {
            // Show buffer loader when playback stalls
            setShowBufferLoader(true);
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

          // hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
          //   console.log(`📦 Loading fragment: ${data.frag.sn}`);
          //   setBufferStatus('Loading fragment...');
          //   setShowBufferLoader(true);
          // });

          hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            console.log(`✅ Fragment loaded: ${data.frag.sn}`);
            setFragmentsLoaded(prev => prev + 1);
            // Update progress based on loaded fragments
            if (hls.levels && hls.levels.length > 0) {
              const totalFragments = hls.levels[0].details?.totalFragments || 0;
              if (totalFragments > 0) {
                const progress = ((data.frag.sn + 1) / totalFragments) * 100;
                setBufferProgress(progress);
                setBufferStatus(`Buffering: ${Math.round(progress)}%`);
              }
            }
          });

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('✅ Level loaded:', data.level);
            setShowBufferLoader(false);
            setBufferProgress(100);
            setBufferStatus('Ready');
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn('HLS error:', data.type, data.details);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
              }
            }
          });

        } else {
          // Native fallback
          video.src = streamingUrl;
          video.load();
        }
      } catch (error) {
        console.error('Error loading HLS.js:', error);
        setError('Failed to load video player');
      }
    };

    if (isHLS) {
      initializeHLS();
    } else {
      video.src = streamingUrl;
      video.load();
    }

    return () => {
      cleanupIntervals();
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamingUrl, isHLS, cleanupIntervals]);




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

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0){
      return `${hours}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2, '0')}`;
    }else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
   
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    }
    resetCursorTimeout(); // Show cursor when using controls
  };


  // Enhanced seek handler with buffer management
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const seekTime = percentage * duration;

      setIsSeeking(true);
      setCurrentTime(seekTime);
      video.currentTime = seekTime;

      if (isPlaying) {
        video.play().catch(err => {
          console.error('Error playing after seek:', err);
        });
      }
    }
    resetCursorTimeout();
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



  const switchCaptionTrack = (trackId) => {
    // Don't allow caption track switching for trailers
    if (isTrailer) {
      console.log('🎬 Caption track switching disabled for trailers');
      return;
    }

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
        console.log(`📝 Switched to caption track: ${selectedTrack.label || selectedTrack.language}`);
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

  // Monitor subtitle display and update captionsEnabled state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    const checkSubtitleDisplay = () => {
      const tracks = Array.from(video.textTracks);
      const hasActiveTrack = tracks.some(track => track.mode === 'showing');

      if (hasActiveTrack && !captionsEnabled) {
        console.log('📝 Detected active subtitle track, enabling captions state');
        setCaptionsEnabled(true);
        setUseNativeSubtitles(true);
      } else if (!hasActiveTrack && captionsEnabled) {
        console.log('📝 No active subtitle track, disabling captions state');
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

  // Monitor availableCaptions changes and ensure currentCaption is set
  useEffect(() => {
    // Only auto-set captions for non-trailers
    if (!isTrailer && availableCaptions.length > 0 && !currentCaption) {
      // Find the default track (English or first track)
      const englishCaption = availableCaptions.find(caption =>
        caption.language && ['en', 'eng', 'english'].includes(caption.language.toLowerCase())
      );
      const defaultCaption = englishCaption || availableCaptions[0];

      if (defaultCaption) {
        setCurrentCaption(defaultCaption);
        console.log('📝 Set currentCaption from availableCaptions:', defaultCaption);
      }
    }
  }, [availableCaptions, currentCaption, isTrailer]);

  // Set up captions based on trailer status
  useEffect(() => {
    if (isTrailer) {
      // Disable all caption functionality for trailers
      setCaptionsEnabled(false);
      setAvailableCaptions([]);
      setCurrentCaption(null);
      setCaptionText('');
      setUseNativeSubtitles(false);
      console.log('🎬 Caption functionality disabled for trailer');
    }
  }, [isTrailer]);



  const BufferLoader = () => {
    const getLoaderContent = () => {
      if (isBuildingBuffer) {
        return {
          text: `Building buffer... ${Math.round(bufferBuildProgress)}%`,
          progress: bufferBuildProgress
        };
      }
      
      if (showBufferLoader) {
        return {
          text: `Buffering... ${Math.round(bufferProgress)}%`,
          progress: bufferProgress
        };
      }
      
      return {
        text: 'Loading...',
        progress: bufferProgress
      };
    };
  
    const { text, progress } = getLoaderContent();
    const displayProgress = Math.round(progress);
  
    return (
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 20,
        background: 'rgba(0, 0, 0, 0.8)', padding: '20px',
        borderRadius: '12px', textAlign: 'center',
        minWidth: '160px'
      }}>
        <div style={{ width: '60px', height: '60px', margin: '0 auto 16px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            border: '4px solid rgba(255, 255, 255, 0.2)', 
            borderTop: '4px solid #ff3e6e',
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: 'white', fontSize: '14px', fontWeight: 'bold'
          }}>
            {displayProgress}%
          </div>
        </div>
        <div style={{ 
          color: 'white', 
          fontSize: '14px', 
          fontWeight: '500',
          minHeight: '20px',
          marginBottom: '8px'
        }}>
          {text}
        </div>
        
        {/* Show fragment progress for HLS */}
        {isHLS && totalFragments > 0 && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }}>
            {fragmentsLoaded} / {totalFragments} fragments
          </div>
        )}
      </div>
    );
  };



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
            Server streaming error ({selectedResolution.toUpperCase()})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        
        position: 'relative',
        backgroundColor: '#000',
        cursor: showCursor ? 'default' : 'none'
      }}
      className={'min-h-[40vh] md:h-full md:w-full lg:min-h-[100vh]'}
      onMouseEnter={() => {
        setIsHovering(true);
        resetCursorTimeout();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        // Don't clear the cursor timeout when mouse leaves - let it auto-hide
        // Only clear timeout if video is paused
        if (!isPlaying) {
          clearCursorTimeout();
        }
        // If video is playing, let the timeout continue to hide cursor
      }}
      onMouseMove={() => {
        setIsHovering(true);
        resetCursorTimeout();
      }}
      onMouseDown={() => {

        resetCursorTimeout();
      }}
      onKeyDown={() => {

        resetCursorTimeout();
      }}
      onTouchStart={() => {

        resetCursorTimeout();
      }}
      // Add fullscreen-specific event handling
      onPointerMove={() => {
        if (isFullscreen) {
          setIsHovering(true);
          resetCursorTimeout();
        }
      }}
      // Add additional fullscreen event handling
      onPointerEnter={() => {
        if (isFullscreen) {
          setIsHovering(true);
          resetCursorTimeout();
        }
      }}
    >
      {/* CSS to override browser subtitle styling */}
      <style>
        {`
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

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Video Element */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000'
        }}
        controls={false}
        preload="metadata"
        playsInline
        muted={isMuted}
        poster={thumbnailUrl}
        autoBuffer={true}
        autoPlay={autoPlay}
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

      {/* Loading/Buffering Overlay */}
      {(isLoading || showBufferLoader) && <BufferLoader />}

{
    showControls && (
        <>
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
            {/* Closed Captions (CC) - Hidden for trailers */}
            {availableCaptions.length > 0 && !isTrailer && (
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
                  justifyContent: "center"
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
                >
   
                  {/* Settings Tabs */}
                  <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    marginBottom: '12px'
                  }}>
                    {/* Hide captions tab for trailers */}
                    {!isTrailer && (
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
                    )}
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

                  {/* Captions Tab - Hidden for trailers */}
                  {settingsTab === 'captions' && !isTrailer && (
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
                        border: '1px solid rgba(255,255,255,0.2)'
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

      {/* YouTube-style Loading Overlay */}
      {/* {(isLoading || isSeeking) && <YouTubeLoader />} */}

      {/* Quality Badge */}
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
        pointerEvents: 'none',
        zIndex: 20,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {selectedResolution.toUpperCase()} ({selectedResolution === 'hd' ? '720P' :
          selectedResolution === 'fhd' ? '1080P' :
            selectedResolution === 'uhd' ? '4K' :
              selectedResolution === 'sd' ? '480P' : 'HD'})
      </div>
        </>
    )
}
     

      {/* Video Title Overlay */}
      {title && (
        <div style={{
          position: 'absolute',
          top: isFullscreen ? '24px' : '16px',
          left: isFullscreen ? '120px' : '100px', // Moved to the right to make room for quality badge
          right: isFullscreen ? '24px' : '16px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
          color: 'white',
          padding: isFullscreen ? '16px 20px' : '12px 16px',
          borderRadius: '8px',
          fontSize: isFullscreen ? '16px' : '14px',
          fontWeight: '500',
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {title}
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
    </div>
  );
};

export default TestServerStreamingPlayer;