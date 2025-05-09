import React, { useEffect } from "react";
import styled from "styled-components";
import { Box, Stack, Typography } from "@mui/material";
import Button from "../../../../2-Components/Buttons/Button";
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import CustomLoader from "../../../../2-Components/Loader/CustomLoader";
import { formatDuration, intervalToDuration } from "date-fns";
import GetRemainingDays from "./GetRemainingDays";

const UDetailHero = ({
  filmData,
  handlePaymentModel,
  currentUserData,
  rateMutation,
  addToWatchlistMutation,
  removeFromWatchlistMutation,
  includedInWatchlist,
  videoPurchased,
  handleWatchVideo,
  videoPurchaseData,
}) => {
  const [backDropUrl, setBackdropUrl] = React.useState(null);
  const [showVideo, setShowVideo] = React.useState(false);
  const [trailerUrl, setTrailerUrl] = React.useState(null);
  const [isVideoPlayed, setIsVideoPlayed] = React.useState(false);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  const [timer, setTimer] = React.useState(null);
  const videoRef = React.useRef(null);
  const heroRef = React.useRef(null);
  const playerRef = React.useRef(null);

  // const handlevideoEnd = () => {
  //   setShowVideo(false);
  // };


  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 5000);
    return () => {
      clearTimeout(timer);
      setShowVideo(false);
    };
  }, []);
  React.useEffect(() => {
    if (
      filmData?.type?.toLowerCase()?.includes("series") ||
      (filmData?.type?.toLowerCase()?.includes("segment") &&
        filmData?.seasons?.length > 0)
    ) {
      if (
        filmData?.season[0]?.episodes?.length > 0 &&
        filmData?.season[0]?.episodes[0]?.posters?.length > 0
      ) {
        let bklink = filmData?.season[0]?.episodes[0]?.posters[0]?.url;

        setBackdropUrl(() => bklink);
      }
    } else if (filmData?.type?.toLowerCase()?.includes("film")) {
      if (
        filmData?.type?.toLowerCase()?.includes("film") ||
        (filmData?.type?.toLowerCase()?.includes("movie") &&
          filmData?.posters?.length > 0)
      ) {
        setBackdropUrl(() => filmData?.posters[0]?.url);
      }
    } else {
      // console.log("posters",filmData)
      if (filmData?.posters?.length > 0) {
        setBackdropUrl(() => filmData?.posters[0]?.url);
      }
    }
  }, [filmData]);

  React.useEffect(() => {
    if (
      filmData?.type?.includes("film") ||
      filmData?.type?.includes("series")
    ) {
      if (filmData?.video?.length > 0) {
        filmData?.video?.filter((data) => {
          if (data?.isTrailer) {
            setTrailerUrl(() => data?.url);
          }
        });
      }
    } else {
      // console.log("filmData", filmData);
      setTrailerUrl(() => filmData?.trailers[0]?.url);
    }
  }, [filmData]);

  // Initialize Plyr player
  useEffect(() => {
    if (showVideo && trailerUrl) {
      const video = videoRef.current;
      if (!video) return;

      console.log('Initializing video player with URL:', trailerUrl);

      // Initialize Plyr with enhanced configuration
      const player = new Plyr(video, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        muted: isVideoMuted,
        autoplay: true,
        playsinline: true,
        ratio: '16:9',
        fullscreen: { enabled: true, iosNative: true },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        captions: { active: true, language: 'auto', update: true },
        loadSprite: true,
        iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4'
      });

      playerRef.current = player;

      // Handle HLS if the URL is an HLS stream
      if (trailerUrl.includes('.m3u8')) {
        console.log('HLS stream detected');
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('Fatal error, cannot recover');
                  hls.destroy();
                  break;
              }
            }
          });

          hls.loadSource(trailerUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, attempting to play');
            video.play().catch(error => {
              console.error('Error playing video:', error);
            });
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Using native HLS support (Safari)');
          video.src = trailerUrl;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(error => {
              console.error('Error playing video:', error);
            });
          });
        }
      } else {
        console.log('Regular video format detected');
        // For regular video formats
        video.src = trailerUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(error => {
            console.error('Error playing video:', error);
          });
        });
      }

      // Handle video errors
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        console.error('Error code:', video.error?.code);
        console.error('Error message:', video.error?.message);
        // Try to recover by reloading the video
        if (player) {
          player.load();
        }
      });

      return () => {
        if (player) {
          player.destroy();
        }
      };
    }
  }, [showVideo, trailerUrl, isVideoMuted]);

  const handleOnLoad = (e) => {
    console.log('Video loaded');
    if (playerRef.current) {
      playerRef.current.play().catch(error => {
        console.error('Error playing video on load:', error);
      });
    }
  };

  const handleOnEnded = () => {
    console.log('Video ended');
    setShowVideo(false);
    setIsVideoPlayed(true);
  };

  const handleMuteVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    if (playerRef.current) {
      playerRef.current.muted = !isVideoMuted;
    }
  };

  const handleReplayVideo = () => {
    setIsVideoPlayed(false);
    setShowVideo(true);
  };

  //handle the scroll behaviour
  useEffect(() => {
    const handleScroll = () => {
      if (!playerRef.current || !heroRef.current) return;

      const heroBounds = heroRef.current.getBoundingClientRect();
      const isHeroInView =
        heroBounds.top >= 0 && heroBounds.bottom <= window.innerHeight;

      if (!isHeroInView && !playerRef.current.paused) {
        playerRef.current.pause();
      } else if (isHeroInView && playerRef.current.paused && showVideo) {
        playerRef.current.play();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showVideo]);

  //handle likes
  const handleLikes = (type) => {
    if (type === "like") {
      let dataValues = {
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        likeType: "THUMBS_UP",
        type:
          filmData?.type === "series" ||
          filmData?.type === "movie" ||
          filmData?.type?.includes("film")
            ? "film"
            : "season",
      };
      rateMutation.mutate(dataValues);
    } else if (type === "dislike") {
      let dataValues = {
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        likeType: "THUMBS_DOWN",
        type:
          filmData?.type === "series" ||
          filmData?.type === "movie" ||
          filmData?.type?.includes("film")
            ? "film"
            : "season",
      };
      rateMutation.mutate(dataValues);
    } else {
      let dataValues = {
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        likeType: "NONE",
        type:
          filmData?.type === "series" ||
          filmData?.type === "movie" ||
          filmData?.type?.includes("film")
            ? "film"
            : "season",
      };
      rateMutation.mutate(dataValues);
    }
  };

  //handle add to watchlist
  const handleAddToWatchlist = () => {
    if (includedInWatchlist) {
      // removeFromWatchlistMutation.mutate({
      //   filmId: filmData?.id,
      //   userId: currentUserData?.id,
      // });

      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type: filmData?.type?.includes("film") ? "film" : filmData?.type?.includes("series") ? "film" : "season",
      });
    } else {
      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type:  filmData?.type?.includes("film") ? "film" : filmData?.type?.includes("series") ? "film" : "season",
      });
    }
  };

  return (
    <HeroContent
      ref={heroRef}
      className={`hidden lg:flex flex-col h-screen w-screen bg-cover bg-no-repeat bg-fixed relative`}
    >
      {!showVideo ? (
        <img
          src={backDropUrl ? backDropUrl : ""}
          //  src={heroImg}
          alt=""
          className="flex absolute top-0 object-cover h-full w-full slect-none bg-gradient-to-b from-transparent to-secondary-700"
          style={{
            filter: "brightness(20%)", // Adjust brightness if needed
          }}
        />
      ) : (
        <div className="flex justify-center items-center absolute top-0 object-cover h-full w-screen md:h-full md:w-full select-none bg-gradient-to-b from-transparent to-secondary-700 overflow-hidden">
          <video
            ref={videoRef}
            className="plyr-react plyr w-full h-full object-cover"
            playsInline
            onLoadedData={handleOnLoad}
            onCanPlay={handleOnLoad}
            onEnded={handleOnEnded}
            muted={isVideoMuted}
            crossOrigin="anonymous"
          >
            {trailerUrl && (
              <>
                {trailerUrl.includes('.m3u8') ? (
                  <source src={trailerUrl} type="application/x-mpegURL" />
                ) : (
                  <>
                    <source src={trailerUrl} type="video/mp4" />
                    <source src={trailerUrl} type="video/webm" />
                    <source src={trailerUrl} type="video/ogg" />
                  </>
                )}
              </>
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {isVideoPlayed || showVideo ? (
        <div className="absolute flex right-0 bottom-20 z-50 w-20 h-10   ">
          {isVideoPlayed ? (
            <div className="flex flex-col justify-center items-start px-3  w-full h-full bg-secondary-900 ">
              <span
                onClick={handleReplayVideo}
                className="icon-[solar--restart-bold] h-6 w-6 text-primary-500 hover:text-whites-40"
              ></span>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-start px-3  w-full h-full bg-secondary-900 ">
              {isVideoMuted ? (
                <span
                  onClick={handleMuteVideo}
                  className="icon-[solar--muted-bold] h-6 w-6 text-primary-500 hover:text-whites-40"
                ></span>
              ) : (
                <span
                  onClick={handleMuteVideo}
                  className="icon-[solar--volume-loud-bold] h-6 w-6 text-primary-500 hover:text-whites-40"
                ></span>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex absolute top-0 object-cover h-full w-full slect-none  bg-gradient-to-b from-transparent to-secondary-800" />
      <Box className="mx-auto h-screen px-5  md:px-16 py-32 flex items-center">
        <Box className="flex flex-col relative  h-screen w-screen ">
          <Box className="w-max absolute left-0 bottom-20">
            <Stack
              spacing={"24px"}
              className="flex flex-col  mx-auto max-w-[300px] lg:max-w-3xl text-left md:max-w-[500px]  lg:w-[500px] overflow-hidden"
            >
              <Typography className="font-[Inter-Bold] line-clamp-1 md:line-clamp-0 text-2xl md:text-5xl text-whites-40 select-none">
                {filmData?.title}
              </Typography>
              <Typography className="line-clamp-3 md:line-clamp-0 font-[Inter-Regular]  text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                {filmData?.type?.includes("film") ||
                filmData?.type?.includes("series")
                  ? filmData?.plotSummary
                  : filmData?.overview}
              </Typography>

              {filmData?.type?.toLowerCase()?.includes("series") ? (
                <div>
                  {filmData?.season?.length > 0 && (
                    <Typography className="font-[Inter-Regular] text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                      {filmData?.season?.length}{" "}
                      {filmData?.season?.length > 2 ? "Segments" : "Segment"}
                    </Typography>
                  )}
                </div>
              ) : null}

              {filmData?.type?.includes("film") ||
              filmData?.type?.includes("series") ? (
                <Stack
                  direction="row"
                  className="flex flex-row items-start space-x-8 select-none"
                >
                  <Typography className="font-[Inter-Regular] text-[#FFFAF6] text-sm md:text-base">
                    {filmData?.type?.includes("film") ||
                    filmData?.type?.includes("series")
                      ? filmData?.yearOfProduction
                      : filmData?.film?.yearOfProduction}
                  </Typography>
                  <ul className="font-[Inter-Regular] text-[#FFFAF6] flex list-disc w-full space-x-8 text-xs sm:text-sm md:text-base md:flex-wrap gap-y-3 items-start justify-start">
                    <li className="w-max">{filmData?.type} </li>

                    {filmData?.genre?.length > 0 && (
                      <>
                        {filmData?.genre?.map((data, index) => (
                          <li key={index} className="w-max">
                            {data}
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </Stack>
              ) : null}

              {/** watch button */}
              <Stack
                direction={"column"}
                spacing={"20px"}
                className="select-none"
              >
                {!videoPurchased && (
                  <>
                    {!filmData?.type?.toLowerCase()?.includes("series") && (
                      <Stack direction="row" className="gap-2">
                        <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span>
                        {filmData?.access?.toLowerCase()?.includes("free") ? (
                          <Typography className="font-[Inter-Medium] text-base text-whites-40">
                            Free to watch
                          </Typography>
                        ) : (
                          <Typography className="font-[Inter-Medium] text-base text-whites-40">
                            Rent to watch
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </>
                )}

                <div className="flex flex-col gap-4">
                  <Stack className="flex flex-col-reverse gap-4 md:gap-0 md:flex-row space-x-3">
                    {/** handle payment */}
                    {!filmData?.type?.toLowerCase()?.includes("series") && (
                      <>
                        {filmData?.access?.toLowerCase()?.includes("free") ? (
                          <Button
                            onClick={handleWatchVideo}
                            className="flex w-max px-8 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                          >
                            <span className="icon-[solar--play-circle-linear] h-6 w-6 text-whites-40"></span>
                            <Typography className="font-[Roboto-Regular] text-base">
                              Watch
                            </Typography>
                          </Button>
                        ) : (
                          <>
                            {videoPurchased ? (
                              <Button
                                onClick={handleWatchVideo}
                                className="flex w-max px-8 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                              >
                                <span className="icon-[solar--play-circle-linear] h-6 w-6 text-whites-40"></span>
                                <Typography className="font-[Roboto-Regular] text-base">
                                  Watch
                                </Typography>
                              </Button>
                            ) : (
                              <Button
                                onClick={handlePaymentModel}
                                className="flex w-max px-8 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                              >
                                <span className="icon-[solar--play-circle-linear] h-6 w-6 text-whites-40"></span>
                                <Typography className="font-[Roboto-Regular] text-base">
                                  Pay to Watch
                                </Typography>
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/** like buttons */}
                    <Stack direction="row" className="space-x-2">
                      {includedInWatchlist ? (
                        <Button
                          onClick={handleAddToWatchlist}
                          className="flex w-max px-2 border-2 border-primary-500 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--bookmark-circle-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      ) : (
                        <Button
                          onClick={handleAddToWatchlist}
                          className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--bookmark-circle-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      )}

                      {filmData?.likes[0]?.type === "THUMBS_UP" ? (
                        <Button
                          disabled={rateMutation.isPending ? true : false}
                          onClick={() => handleLikes("none")}
                          className="flex w-max px-2 py-2 items-center justify-center space-x-2 border-2 border-primary-500  rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--like-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      ) : (
                        <Button
                          disabled={rateMutation.isPending ? true : false}
                          onClick={() => handleLikes("like")}
                          className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--like-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      )}

                      {filmData?.likes[0]?.type === "THUMBS_DOWN" ? (
                        <Button
                          disabled={rateMutation.isPending ? true : false}
                          onClick={() => handleLikes("none")}
                          className="flex w-max px-2 py-2 items-center justify-center border-2 border-primary-500  space-x-2 rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--dislike-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      ) : (
                        <Button
                          disabled={rateMutation.isPending ? true : false}
                          onClick={() => handleLikes("dislike")}
                          className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
                        >
                          <span className="icon-[solar--dislike-broken] h-6 w-6 text-whites-40"></span>
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {videoPurchaseData?.length > 0 && (
                   <GetRemainingDays expiryDate={videoPurchaseData[0]?.expiresAt} />
                  )}
                </div>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/** loader */}
      {rateMutation.isPending ||
      addToWatchlistMutation.isPending ||
      removeFromWatchlistMutation.isPending ? (
        <div className="absolute flex w-full h-full items-center justify-center">
          <CustomLoader />
        </div>
      ) : null}
    </HeroContent>
  );
};

export default UDetailHero;

const HeroContent = styled.div`
  .plyr {
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .plyr--video {
    background: transparent;
  }

  .plyr--full-ui input[type=range] {
    color: #fff;
  }

  .plyr__control--overlaid {
    background: rgba(255, 255, 255, 0.9);
  }

  .plyr__control:hover {
    background: #fff;
  }

  .plyr__control--overlaid:hover {
    background: #fff;
  }

  .plyr--video .plyr__control.plyr__tab-focus,
  .plyr--video .plyr__control:hover,
  .plyr--video .plyr__control[aria-expanded=true] {
    background: #fff;
  }

  .plyr__control.plyr__tab-focus {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .plyr__menu__container {
    background: rgba(28, 28, 28, 0.9);
  }
`;
