import React, { useEffect } from "react";
import styled from "styled-components";
import { Box, Stack, Typography } from "@mui/material";
import Button from "../../../2-Components/Buttons/Button";
import heroImg from "../../../1-Assets/Hero.png";
import CustomLoader from "../../../2-Components/Loader/CustomLoader";
import { formatDuration, intervalToDuration } from "date-fns";
import GetRemainingDays from "./GetRemainingDays";
import HeroTrailerPlayer from "../../../2-Components/VideoPlayer/HeroTrailerPlayer";
import TestHeroTrailerPlayer from "../../../2-Components/VideoPlayer/TestHeroPlayer5";

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
  const [isVideoPlayed, setIsVideoPlayed] = React.useState(false);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  const [isVideoVisible, setIsVideoVisible] = React.useState(true); // Track video visibility
  const [isVideoPaused, setIsVideoPaused] = React.useState(false); // Track if video is paused
  const heroRef = React.useRef(null);

  // Auto-show trailer after 2 seconds (reduced from 5 for faster experience)
  React.useEffect(() => {
    if (!filmData?.id) {
      console.log('🎬 UDetailHero: No film data, skipping auto-show timer');
      return;
    }
    
    console.log('🎬 UDetailHero: Starting auto-show timer for trailer');
    const timer = setTimeout(() => {
      console.log('🎬 UDetailHero: Auto-show timer triggered, showing video');
      setShowVideo(true);
      setIsVideoVisible(true); // Also set video as visible
    }, 2000); // Reduced from 5000ms to 2000ms for faster experience
    return () => {
      console.log('🎬 UDetailHero: Clearing auto-show timer');
      clearTimeout(timer);
      setShowVideo(false);
      setIsVideoVisible(false);
    };
  }, [filmData?.id]);

  // Reset video display state when film changes (navigating to different film)
  React.useEffect(() => {
    console.log('🎬 UDetailHero: Film data changed, resetting video display state');
    
    // Only reset the display state, let the HeroTrailerPlayer handle its own cleanup
    setShowVideo(false);
    setIsVideoPlayed(false);
    setIsVideoPaused(false);
    
    console.log('🎬 UDetailHero: Video display state reset complete');
  }, [filmData?.id]);

  // Set backdrop image
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
      if (filmData?.posters?.length > 0) {
        setBackdropUrl(() => filmData?.posters[0]?.url);
      }
    }
  }, [filmData]);

  const handleVideoEnded = () => {
    console.log('🎬 UDetailHero: Trailer ended, hiding video and setting played state');
    setShowVideo(false);
    setIsVideoPlayed(true);
    setIsVideoVisible(false); // Reset visibility when video ends
  };

  const handleReplayVideo = () => {
    console.log('🎬 UDetailHero: Replay requested, showing video again');
    setIsVideoPlayed(false);
    setShowVideo(true);
    setIsVideoVisible(true); // Set video as visible when replaying
  };

  const handleVideoError = (error) => {
    console.error('🎬 UDetailHero: Trailer error:', error);
    setShowVideo(false);
  };

  const handleVideoLoaded = () => {
    console.log('🎬 UDetailHero: Trailer loaded successfully');
  };

  const handleVideoPlay = () => {
    console.log('🎬 UDetailHero: Video started playing');
    setIsVideoPaused(false);
  };

  const handleVideoPause = () => {
    console.log('🎬 UDetailHero: Video paused');
    setIsVideoPaused(true);
  };

  const handleTogglePlayPause = () => {
    if (isVideoPaused) {
      console.log('🎬 UDetailHero: Resuming video playback');
      setIsVideoPaused(false);
      setIsVideoVisible(true); // Ensure video is visible when resuming
    } else {
      console.log('🎬 UDetailHero: Pausing video playback');
      setIsVideoPaused(true);
      setIsVideoVisible(false); // Hide video when pausing
    }
  };

  // Handle scroll behavior for video pausing
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;

      const heroBounds = heroRef.current.getBoundingClientRect();
      const isHeroInView =
        heroBounds.top >= 0 && heroBounds.bottom <= window.innerHeight;

      if (!isHeroInView && isVideoVisible) {
        console.log('🎬 UDetailHero: Hero out of view, pausing video');
        // Pause video when out of view
        setIsVideoVisible(false);
      } else if (isHeroInView && !isVideoVisible && !isVideoPlayed) {
        console.log('🎬 UDetailHero: Hero back in view, resuming video');
        // Resume video when back in view (but only if it hasn't finished playing)
        setIsVideoVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVideoVisible, isVideoPlayed]);

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
          <TestHeroTrailerPlayer
            key={filmData?.id} // Force re-render when film changes
            resourceId={filmData?.id}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            onLoaded={handleVideoLoaded}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            isPaused={setIsVideoMuted}
            autoPlay={true}
            muted={isVideoMuted}
            loop={false}
            showControls={false}
            isVisible={isVideoVisible && !isVideoPaused}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%'
            }}
            isTrailer={true}
            thumbnailUrl={backDropUrl ? backDropUrl : ""}
          />
          
          {/* Pause overlay indicator */}
          {isVideoPaused && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="text-whites-100 text-center">
                <span className="icon-[solar--pause-circle-bold] h-16 w-16 text-whites-100 opacity-80"></span>
                <p className="mt-2 text-lg font-medium">Trailer Paused</p>
                <p className="text-sm opacity-80">Click play button to resume</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isVideoPlayed || showVideo ? (
        <div className="absolute flex right-0 bottom-20 z-50 w-32 h-12   ">
          {isVideoPlayed ? (
            <div className="flex flex-row justify-center items-center px-3 py-2 w-full h-full bg-secondary-900">
              <span
                onClick={handleReplayVideo}
                className="icon-[solar--restart-bold] h-6 w-6 text-primary-500 hover:text-whites-40 cursor-pointer"
                title="Replay trailer"
              ></span>
            </div>
          ) : (
            <div className="flex flex-row justify-center items-center px-3 py-2 w-full h-full bg-secondary-900 space-x-3">
              {/* Mute/Unmute button */}
              {isVideoMuted ? (
                <span
                  onClick={() => setIsVideoMuted(false)}
                  className="icon-[solar--muted-bold] h-6 w-6 text-primary-500 hover:text-whites-40 cursor-pointer"
                  title="Unmute trailer"
                ></span>
              ) : (
                <span
                  onClick={() => setIsVideoMuted(true)}
                  className="icon-[solar--volume-loud-bold] h-6 w-6 text-primary-500 hover:text-whites-40 cursor-pointer"
                  title="Mute trailer"
                ></span>
              )}
              
              {/* Play/Pause button */}
              <span
                onClick={handleTogglePlayPause}
                className={`h-6 w-6 text-primary-500 hover:text-whites-40 cursor-pointer ${
                  isVideoPaused ? 'icon-[solar--play-circle-bold]' : 'icon-[solar--pause-circle-bold]'
                }`}
                title={isVideoPaused ? 'Play trailer' : 'Pause trailer'}
              ></span>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex absolute top-0 object-cover h-full w-full slect-none  bg-gradient-to-b from-transparent to-secondary-800" />
      <Box className="mx-auto h-screen px-5  md:px-16 py-32 flex items-center z-20">
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

const HeroContent = styled.div``;
