import React, { useEffect, useRef, useState } from 'react';
import apiRequest from '../../3-Middleware/apiRequest';
import './HeroTrailerPlayer.css';

const HeroTrailerPlayer = ({ 
  resourceId,
  onEnded,
  onError,
  onLoaded,
  onPlay,
  onPause,
  autoPlay = true,
  muted = true,
  loop = false,
  showControls = false,
  className = "",
  style = {},
  isVisible = true // New prop to control visibility/pause state
}) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHLS, setIsHLS] = useState(false);
  const [hlsInstance, setHlsInstance] = useState(null);
  const [wasPlaying, setWasPlaying] = useState(false); // Track if video was playing before pause
  const [userInteracted, setUserInteracted] = useState(false); // Track if user has interacted with page

  // Track user interaction for autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      console.log('🎬 HeroTrailerPlayer: User interaction detected, autoplay enabled');
    };

    // Listen for various user interactions
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('scroll', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  // Immediate preloading for faster playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set aggressive preloading immediately
    video.preload = 'metadata';
    video.load();
    
    console.log('🎬 HeroTrailerPlayer: Immediate preloading started');
  }, []);

  // Handle pause/resume based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !trailerUrl) return;

    if (isVisible) {
      // Resume playback if it was playing before
      if (wasPlaying && !isPlaying) {
        console.log('🎬 HeroTrailerPlayer: Resuming playback');
        // Small delay to ensure the video element is ready
        setTimeout(() => {
          video.play().catch((error) => {
            console.error('🎬 HeroTrailerPlayer: Failed to resume playback:', error);
            // If resume fails, try to reload the video
            if (video.readyState < 2) { // HAVE_CURRENT_DATA
              console.log('🎬 HeroTrailerPlayer: Video not ready, reloading...');
              video.load();
              setTimeout(() => video.play().catch(console.error), 100);
            }
          });
        }, 100);
      }
      
      // If video is ready and should autoplay, try to start it
      if (autoPlay && !isPlaying && video.readyState >= 2) {
        console.log('🎬 HeroTrailerPlayer: Video ready, attempting autoplay');
        // Try muted autoplay first (more likely to succeed)
        video.muted = true;
        video.play().then(() => {
          console.log('🎬 HeroTrailerPlayer: Muted autoplay successful');
          // Unmute after successful start
          setTimeout(() => {
            video.muted = muted;
          }, 100);
        }).catch((error) => {
          console.log('🎬 HeroTrailerPlayer: Muted autoplay failed, trying with user interaction:', error.message);
          // If muted autoplay fails, wait for user interaction
          setUserInteracted(false);
        });
      }
    } else {
      // Pause playback and remember state
      if (isPlaying) {
        console.log('🎬 HeroTrailerPlayer: Pausing playback');
        setWasPlaying(true);
        video.pause();
      }
    }
  }, [isVisible, isPlaying, wasPlaying, trailerUrl, autoPlay, muted]);

  // Prevent HLS instance recreation on URL changes if it's the same URL
  const [currentUrl, setCurrentUrl] = useState(null);

  // Get trailer URL from user streaming API
  useEffect(() => {
    const getTrailerUrl = async () => {
      if (!resourceId) {
        console.error('🎬 HeroTrailerPlayer: No resourceId provided');
        setError('No resource ID provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🎬 HeroTrailerPlayer: Getting trailer for resource: ${resourceId}`);
        
        // Use the new user streaming API
        const response = await apiRequest.get(`/v1/userStreaming/trailer/${resourceId}`);
        const data = response.data;
        
        if (data.success && data.streamingUrls) {
          console.log('🎬 HeroTrailerPlayer: Trailer data received:', data);
          
          // Prefer HLS URL for better streaming
          const streamUrl = data.streamingUrls.hls || data.streamingUrls.direct;
          setTrailerUrl(streamUrl);
          setIsHLS(streamUrl?.includes('.m3u8'));
          
          console.log('🎬 HeroTrailerPlayer: Trailer URL set:', streamUrl);
          
          // Preload the video element immediately for faster playback
          if (streamUrl) {
            const video = videoRef.current;
            if (video) {
              video.preload = 'auto';
              video.load();
            }
          }
        } else {
          console.error('🎬 HeroTrailerPlayer: No trailer found for resource:', resourceId);
          setError('No trailer available');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🎬 HeroTrailerPlayer: Error getting trailer:', error);
        setError('Failed to load trailer');
        setIsLoading(false);
      }
    };

    getTrailerUrl();
  }, [resourceId]);

  // Simple cleanup when resourceId changes - just stop current video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only stop if there's a different URL already loaded
    if (video.src && trailerUrl && video.src !== trailerUrl) {
      console.log('🎬 HeroTrailerPlayer: Resource changed, stopping current trailer');
      video.pause();
      video.currentTime = 0;
    }
  }, [resourceId, trailerUrl]);

  // Aggressive autoplay when trailer URL is set and component is visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !trailerUrl || !isVisible) return;

    // Try to start playback when trailer URL is set and component is visible
    if (autoPlay && video.readyState >= 2) {
      console.log('🎬 HeroTrailerPlayer: Trailer ready and visible, attempting aggressive autoplay');
      
      // Try muted autoplay first (more likely to succeed)
      video.muted = true;
      video.play().then(() => {
        console.log('🎬 HeroTrailerPlayer: Aggressive autoplay successful');
        // Unmute after successful start
        setTimeout(() => {
          video.muted = muted;
        }, 100);
      }).catch((error) => {
        console.log('🎬 HeroTrailerPlayer: Aggressive autoplay failed:', error.message);
        // If autoplay fails, wait for user interaction
        setUserInteracted(false);
      });
    }
    
    // Fallback autoplay attempt after a short delay
    if (autoPlay && isVisible) {
      const fallbackTimer = setTimeout(() => {
        if (video && video.readyState >= 2 && !isPlaying) {
          console.log('🎬 HeroTrailerPlayer: Fallback autoplay attempt');
          // Try muted autoplay again
          video.muted = true;
          video.play().then(() => {
            console.log('🎬 HeroTrailerPlayer: Fallback autoplay successful');
            // Unmute after successful start
            setTimeout(() => {
              video.muted = muted;
            }, 100);
          }).catch((error) => {
            console.log('🎬 HeroTrailerPlayer: Fallback autoplay failed:', error.message);
          });
        }
      }, 500); // 500ms delay for fallback attempt
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [trailerUrl, isVisible, autoPlay, muted, isPlaying]);

  // Handle video loading and HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !trailerUrl) return;

    // Prevent unnecessary HLS recreation if URL hasn't changed
    if (currentUrl === trailerUrl && hlsInstance) {
      console.log('🎬 HeroTrailerPlayer: URL unchanged, reusing existing HLS instance');
      return;
    }

    console.log('🎬 HeroTrailerPlayer: Setting up video element with URL:', trailerUrl);
    setCurrentUrl(trailerUrl);

    const setupVideo = async () => {
      try {
        if (isHLS) {
          // Handle HLS files
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            console.log('🎬 HeroTrailerPlayer: HLS.js supported, initializing...');
            
            // Clean up existing HLS instance only if URL changed
            if (hlsInstance && currentUrl !== trailerUrl) {
              console.log('🎬 HeroTrailerPlayer: Cleaning up old HLS instance for new URL');
              hlsInstance.destroy();
              setHlsInstance(null);
            }
            
            // Create new HLS instance only if needed
            let hls = hlsInstance; // Use existing instance if available
            if (!hls || currentUrl !== trailerUrl) {
              console.log('🎬 HeroTrailerPlayer: Creating new HLS instance');
              hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: false,
                // Optimized buffer settings for continuous playback
                backBufferLength: 60, // Increased from 30 to 60 seconds
                maxBufferLength: 60, // Increased from 30 to 60 seconds
                maxMaxBufferLength: 120, // Increased from 60 to 120 seconds
                maxBufferSize: 120 * 1000 * 1000, // Increased to 120MB for better buffering
                maxBufferHole: 0.05, // Reduced from 0.1 for smoother playback
                highBufferWatchdogPeriod: 2, // Increased from 1 for better stability
                nudgeOffset: 0.1, // Increased from 0.05 for better seeking
                nudgeMaxRetry: 10, // Increased from 5 for better retry logic
                maxFragLookUpTolerance: 0.2, // Increased from 0.1 for better fragment handling
                startLevel: -1, // Auto quality selection
                capLevelToPlayerSize: true,
                testBandwidth: true, // Enable bandwidth testing for better quality selection
                progressive: false,
                stretchShortVideoTrack: false,
                maxBufferStarvationDelay: 4, // Increased from 2 for better buffering
                // Advanced buffering settings
                maxStarvationDelay: 4,
                maxLoadingDelay: 4,
                // Fragment loading optimization - increased timeouts for better reliability
                fragLoadingTimeOut: 30000, // Increased from 20000 to 30000ms (30 seconds)
                fragLoadingMaxRetry: 6, // Increased from 4 to 6 retry attempts
                fragLoadingRetryDelay: 2000, // Increased from 1000 to 2000ms for better backoff
                // Manifest loading optimization
                manifestLoadingTimeOut: 15000, // Increased from 10000 to 15000ms
                manifestLoadingMaxRetry: 4, // Increased from 3 to 4 retry attempts
                manifestLoadingRetryDelay: 1000, // Increased from 500 to 1000ms
                // Level switching optimization
                levelLoadingTimeOut: 15000, // Increased from 10000 to 15000ms
                levelLoadingMaxRetry: 4, // Increased from 3 to 4 retry attempts
                levelLoadingRetryDelay: 1000, // Increased from 500 to 1000ms
                // Disable subtitle functionality for trailers
                enableWebVTT: false,
                enableIMSC1: false,
                enableCEA708Captions: false,
                enableDateRangeMetadataCues: false,
                enableEmsgMetadataCues: false,
                subtitleDisplay: false,
                subtitleTrackSelectionMode: 'none',
                subtitlePreference: [],
                enableSubtitleStreaming: false,
                subtitleStreamingMode: 'none'
              });
              
              setHlsInstance(hls);
            }
            
            hls.loadSource(trailerUrl);
            hls.attachMedia(video);
            
            // Aggressive preloading for faster playback
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('🎬 HeroTrailerPlayer: HLS manifest parsed');
              setIsLoading(false);
              if (onLoaded) onLoaded();
              
                          // Auto-play if requested - try muted autoplay first for better success rate
            if (autoPlay) {
              console.log('🎬 HeroTrailerPlayer: Attempting autoplay');
              // Try muted autoplay first (more likely to succeed)
              video.muted = true;
              video.play().then(() => {
                console.log('🎬 HeroTrailerPlayer: Muted autoplay successful');
                // Unmute after successful start
                setTimeout(() => {
                  video.muted = muted;
                }, 100);
              }).catch((error) => {
                console.log('🎬 HeroTrailerPlayer: Autoplay failed, waiting for user interaction:', error.message);
                // If autoplay fails, wait for user interaction
                setUserInteracted(false);
              });
            }
            });
            
            // Preload fragments aggressively
            hls.on(Hls.Events.LEVEL_LOADED, () => {
              console.log('🎬 HeroTrailerPlayer: Level loaded, ensuring continuous buffering');
              // Force preloading of next fragments
              hls.trigger(Hls.Events.FRAG_LOADING);
            });
            
            // Handle fragment loading for continuous playback
            hls.on(Hls.Events.FRAG_LOADING, () => {
              console.log('🎬 HeroTrailerPlayer: Fragment loading started');
            });
            
            // Handle fragment loaded for smooth playback
            hls.on(Hls.Events.FRAG_LOADED, () => {
              console.log('🎬 HeroTrailerPlayer: Fragment loaded successfully');
            });
            
            // Handle buffer events for continuous playback
            hls.on(Hls.Events.BUFFER_APPENDING, () => {
              console.log('🎬 HeroTrailerPlayer: Buffer appending for smooth playback');
            });
            
            // Handle buffer events for continuous playback
            hls.on(Hls.Events.BUFFER_APPENDED, () => {
              console.log('🎬 HeroTrailerPlayer: Buffer appended successfully');
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('🎬 HeroTrailerPlayer: HLS error:', data);
              if (data.fatal) {
                setError('HLS playback error');
                setIsLoading(false);
                if (onError) onError('HLS playback error');
              }
            });
            
          } else {
            console.log('🎬 HeroTrailerPlayer: HLS.js not supported, falling back to native video');
            // Fallback to native video
            video.src = trailerUrl;
            video.load();
          }
        } else {
          // Handle MP4 files
          console.log('🎬 HeroTrailerPlayer: Setting up MP4 video');
          video.src = trailerUrl;
          video.load();
        }
        
        // Set up video event listeners
        const handleCanPlay = () => {
          console.log('🎬 HeroTrailerPlayer: Video can play');
          setIsLoading(false);
          if (onLoaded) onLoaded();
          
          // Auto-play if requested - try muted autoplay first for better success rate
          if (autoPlay) {
            console.log('🎬 HeroTrailerPlayer: Starting immediate playback');
            // Try muted autoplay first (more likely to succeed)
            video.muted = true;
            video.play().then(() => {
              console.log('🎬 HeroTrailerPlayer: Muted autoplay successful');
              // Unmute after successful start
              setTimeout(() => {
                video.muted = muted;
              }, 100);
            }).catch((error) => {
              console.log('🎬 HeroTrailerPlayer: Playback failed:', error.message);
              // If autoplay fails, wait for user interaction
              setUserInteracted(false);
            });
          }
        };
        
        // Add faster loading detection
        const handleLoadedMetadata = () => {
          console.log('🎬 HeroTrailerPlayer: Video metadata loaded, ready for playback');
          // Try to start playback as soon as metadata is loaded
          if (autoPlay && !isLoading) {
            console.log('🎬 HeroTrailerPlayer: Starting playback from metadata loaded');
            // Try muted autoplay first
            video.muted = true;
            video.play().then(() => {
              console.log('🎬 HeroTrailerPlayer: Metadata autoplay successful');
              // Unmute after successful start
              setTimeout(() => {
                video.muted = muted;
              }, 100);
            }).catch((error) => {
              console.log('🎬 HeroTrailerPlayer: Metadata playback failed:', error.message);
              // If autoplay fails, wait for user interaction
              setUserInteracted(false);
            });
          }
        };
        
        const handleLoadedData = () => {
          console.log('🎬 HeroTrailerPlayer: Video data loaded, ensuring smooth playback');
          setIsLoading(false);
        };
        
        const handlePlay = () => {
          console.log('🎬 HeroTrailerPlayer: Video started playing');
          setIsPlaying(true);
          setWasPlaying(false); // Reset wasPlaying since we're now playing
          if (onPlay) onPlay();
        };
        
        const handlePause = () => {
          console.log('🎬 HeroTrailerPlayer: Video paused');
          setIsPlaying(false);
          if (onPause) onPause();
        };
        
        const handleEnded = () => {
          console.log('🎬 HeroTrailerPlayer: Video ended');
          if (onEnded) onEnded();
        };
        
        const handleError = (e) => {
          console.error('🎬 HeroTrailerPlayer: Video error:', e);
          setError('Video playback error');
          setIsLoading(false);
          if (onError) onError('Video playback error');
        };
        
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('error', handleError);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('loadeddata', handleLoadedData);
        
        // Cleanup function
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('ended', handleEnded);
          video.removeEventListener('error', handleError);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('loadeddata', handleLoadedData);
        };
        
      } catch (error) {
        console.error('🎬 HeroTrailerPlayer: Error setting up video:', error);
        setError('Failed to setup video player');
        setIsLoading(false);
        if (onError) onError('Failed to setup video player');
      }
    };
    
    setupVideo();
    
    // Cleanup HLS instance on unmount
    return () => {
      if (hlsInstance) {
        console.log('🎬 HeroTrailerPlayer: Cleaning up HLS instance');
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [trailerUrl, isHLS, autoPlay, onLoaded, onEnded, onError, userInteracted, onPlay, onPause]);

  // Handle video attributes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Start muted for better autoplay success rate
    video.muted = true;
    video.loop = loop;
    video.controls = showControls;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    
    // Unmute after a short delay if not supposed to be muted
    if (!muted) {
      setTimeout(() => {
        if (video) {
          video.muted = muted;
        }
      }, 200);
    }
  }, [muted, loop, showControls]);



  if (error) {
    return (
      <div className={`hero-trailer-error ${className}`} style={style}>
        <div className="error-message">
          <span className="icon-[solar--danger-triangle-bold] h-8 w-8 text-red-500"></span>
          <p>Trailer unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero-trailer-player ${className}`} style={style}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <span className="icon-[solar--refresh-circle-bold] h-6 w-6 text-white animate-spin"></span>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="hero-video"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000'
        }}
        muted={true} // Start muted for better autoplay success
        loop={loop}
        controls={showControls}
        playsInline={true}
        preload="metadata"
        crossOrigin="anonymous"
        autoPlay={autoPlay}
      />
      
      {/* Netflix-style subtle overlay for better text readability */}
      <div className="hero-overlay" />
    </div>
  );
};

export default HeroTrailerPlayer;