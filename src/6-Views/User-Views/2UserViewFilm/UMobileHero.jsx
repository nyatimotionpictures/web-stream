import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Icon, IconButton, Slider, Stack, Typography } from "@mui/material";
import Button from "../../../2-Components/Buttons/Button";
import CustomLoader from "../../../2-Components/Loader/CustomLoader";
import TextClamped from "../../../2-Components/Stacks/TextClamped";
import { useNavigate } from "react-router-dom";
import GetRemainingDays from "./GetRemainingDays";
import HeroTrailerPlayer from "../../../2-Components/VideoPlayer/HeroTrailerPlayer";
import TestHeroTrailerPlayer from "../../../2-Components/VideoPlayer/TestHeroPlayer5";

const UMobileHero = ({
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
  const [trailerVideos, setTrailerVideos] = React.useState([]);
  const [isVideoVisible, setIsVideoVisible] = React.useState(true); // Track video visibility
  const [isVideoPaused, setIsVideoPaused] = React.useState(false); // Track if video is paused
  const heroRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const navigate = useNavigate();

  // Controls visibility for mobile
  const [controlsVisible, setControlsVisible] = React.useState(false);
  const handleMouseMove = () => {
    if (!controlsVisible) {
      setControlsVisible(true);
    }
    resetInactivityTimeout();
  };

  const resetInactivityTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const toggleControls = () => {
    setControlsVisible((prev) => !prev);
    resetInactivityTimeout();
  };

  React.useEffect(() => {
    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener("mousemove", handleMouseMove);
      resetInactivityTimeout();
      return () => {
        hero.removeEventListener("mousemove", handleMouseMove);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, []);

  // Auto-show trailer after 2 seconds (reduced from 5 for faster experience)
  React.useEffect(() => {
    if (!filmData?.id || !trailerVideos?.length > 0) {
      console.log('🎬 UMobileHero: No film data or trailer, skipping auto-show timer');
      return;
    }
    
    console.log('🎬 UMobileHero: Starting auto-show timer for trailer');
    const timer = setTimeout(() => {
      console.log('🎬 UMobileHero: Auto-show timer triggered, showing video');
      setShowVideo(true);
      setIsVideoVisible(true); // Also set video as visible
    }, 2000); // Reduced from 5000ms to 2000ms for faster experience
    return () => {
      console.log('🎬 UMobileHero: Clearing auto-show timer');
      clearTimeout(timer);
      setShowVideo(false);
      setIsVideoVisible(false);
    };
  }, [filmData?.id, trailerVideos]);

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
  React.useEffect(() => {
    if (
      filmData?.type?.includes("film") ||
      filmData?.type?.includes("series")
    ) {
      if (filmData?.video?.length > 0) {
        filmData?.video?.filter((data) => {
          if (data?.isTrailer) {
            setTrailerVideos(() => [data]);
          }
        });
      }
    } else {
      // console.log("filmData", filmData);
      setTrailerVideos(() => [filmData?.trailers[0]]);
    }
  }, [filmData]);

 

  const handleVideoEnded = () => {
    console.log('🎬 UMobileHero: Trailer ended, hiding video and setting played state');
    setShowVideo(false);
    setIsVideoPlayed(true);
    setIsVideoVisible(false); // Reset visibility when video ends
  };

  const handleReplayVideo = () => {
    console.log('🎬 UMobileHero: Replay requested, showing video again');
    setIsVideoPlayed(false);
    setShowVideo(true);
    setIsVideoVisible(true); // Set video as visible when replaying
    setIsVideoPaused(false); // Ensure video is not paused when replaying
  };

  const handleVideoError = (error) => {
    console.error('🎬 UMobileHero: Trailer error:', error);
    setShowVideo(false);
  };

  const handleVideoLoaded = () => {
    console.log('🎬 UMobileHero: Trailer loaded successfully');
  };

  const handleVideoPlay = () => {
    console.log('🎬 UMobileHero: Video started playing');
    setIsVideoPaused(false);
  };

  const handleVideoPause = () => {
    console.log('🎬 UMobileHero: Video paused');
    setIsVideoPaused(true);
  };

  const handleTogglePlayPause = () => {
    if (isVideoPaused) {
      console.log('🎬 UMobileHero: Resuming video playback');
      setIsVideoPaused(false);
      setIsVideoVisible(true); // Ensure video is visible when resuming
    } else {
      console.log('🎬 UMobileHero: Pausing video playback');
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
        console.log('🎬 UMobileHero: Hero out of view, pausing video');
        // Pause video when out of view
        setIsVideoVisible(false);
      } else if (isHeroInView && !isVideoVisible && !isVideoPlayed) {
        console.log('🎬 UMobileHero: Hero back in view, resuming video');
        // Resume video when back in view (but only if it hasn't finished playing)
        setIsVideoVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVideoVisible, isVideoPlayed]);

  //console.log(filmData)

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
      //  removeFromWatchlistMutation.mutate({
      //    filmId: filmData?.id,
      //    userId: currentUserData?.id,
      //  })
      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type: filmData?.type?.includes("film")
          ? "film"
          : filmData?.type?.includes("series")
          ? "film"
          : "season",
      });
    } else {
      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type: filmData?.type?.includes("film")
          ? "film"
          : filmData?.type?.includes("series")
          ? "film"
          : "season",
      });
    }
  };

  return (
    <div
      ref={heroRef}
      className="flex flex-col relative lg:hidden w-full h-full"
    >
      {/** Video */}
      {!trailerVideos?.length > 0 ? (
        <div className="flex items-center justify-center w-full h-full min-h-[30vh] text-whites-40 text-lg">
          {/** Close Button */}
          <div className="absolute flex right-2 top-2 z-50 w-max h-max">
            <Button
              onClick={() => navigate(-1)}
              className="flex flex-col justify-center items-start px-0 sm:px-2 sm:py-2 md:max-w-max h-full bg-transparent hover:bg-transparent rounded-full z-50"
            >
              <div>
                <IconButton>
                  <span className="icon-[carbon--close] h-6 w-6 md:h-6 md:w-6 text-whites-40 hover:text-whites-40"></span>
                </IconButton>
              </div>
            </Button>
          </div>
          No Trailer Uploaded
        </div>
      ) : !showVideo && isVideoPlayed ? (
        <div className="flex items-center justify-center w-full h-full min-h-[30vh] text-whites-40 text-lg">
          {/** Close Button */}
          <div className="absolute flex right-2 top-2 z-50 w-max h-max">
            <Button
              onClick={() => navigate(-1)}
              className="flex flex-col justify-center items-start px-0 sm:px-2 sm:py-2 md:max-w-max h-full bg-transparent hover:bg-transparent rounded-full z-50"
            >
              <div>
                <IconButton>
                  <span className="icon-[carbon--close] h-6 w-6 md:h-6 md:w-6 text-whites-40 hover:text-whites-40"></span>
                </IconButton>
              </div>
            </Button>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <p>Trailer finished</p>
            <Button
              onClick={handleReplayVideo}
              className="flex px-6 py-3 items-center justify-center space-x-2 rounded-full bg-secondary-300 bg-opacity-80 text-whites-40 hover:bg-secondary-300 hover:bg-opacity-100"
            >
              <span className="icon-[solar--restart-bold] h-6 w-6 text-whites-40"></span>
              <span className="font-medium">Replay Trailer</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <div className="flex justify-center items-center object-cover h-full w-screen min-h-[30vh] md:h-full md:w-full select-none bg-gradient-to-b from-transparent to-secondary-700 overflow-hidden relative">
            
            <TestHeroTrailerPlayer
              resourceId={filmData?.id}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onLoaded={handleVideoLoaded}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              autoPlay={true}
              muted={isVideoMuted}
              loop={false}
              thumbnailUrl={backDropUrl}
              showControls={false}
              isVisible={isVideoVisible && !isVideoPaused}
              className="w-full h-full"
              style={{
                width: '100%',
                height: '100%'
              }}
              isTrailer={true}
            />

     

            {/** controls */}
            <div
              className={`flex absolute top-0 flex-col justify-end items-flex z-50 w-full h-full ${
                controlsVisible || isVideoPaused
                  ? "bg-secondary-900 bg-opacity-20"
                  : "bg-transparent bg-opacity-80"
              }`}
            >
              {/** Play/Pause Button */}
              <div className="absolute flex right-0 left-0 bottom-0 top-0 m-auto z-50 w-max h-max">
                {!isVideoPlayed ? (
                  <Button
                    onClick={handleTogglePlayPause}
                    className={`flex-col justify-center items-start px-2 py-2 max-w-max h-full bg-secondary-300 bg-opacity-40 rounded-full ${
                      controlsVisible || isVideoPaused ? "flex" : "hidden"
                    }`}
                  >
                    {isVideoPaused ? (
                      <IconButton>
                        <span className="icon-[solar--play-bold] flex h-10 w-10 text-whites-40 hover:text-whites-40"></span>
                      </IconButton>
                    ) : (
                      <IconButton>
                        <span className="icon-[solar--pause-bold] h-10 w-10 text-whites-40 hover:text-whites-40"></span>
                      </IconButton>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col justify-center items-start px-2 py-2 max-w-max h-full bg-secondary-900 bg-opacity-80 rounded-full">
                    <IconButton>
                      <span
                        onClick={handleReplayVideo}
                        className="icon-[solar--restart-bold] h-8 w-8 text-whites-40 hover:text-whites-40 cursor-pointer"
                        title="Replay trailer"
                      ></span>
                    </IconButton>
                  </div>
                )}
              </div>

              {/** Close Button */}
              <div className="absolute flex right-2 top-2 z-50 w-max h-max">
                <Button
                  onClick={() => navigate(-1)}
                  className="flex flex-col justify-center items-start px-0 sm:px-2 sm:py-2 md:max-w-max h-full bg-transparent md:bg-secondary-900 bg-opacity-80 rounded-full z-50"
                >
                  <div>
                    <IconButton>
                      <span className="icon-[carbon--close] h-10 w-10 md:h-6 md:w-6 text-whites-40 hover:text-whites-40"></span>
                    </IconButton>
                  </div>
                </Button>
              </div>

              {/** Mute Button */}
              {!isVideoPlayed && (
                <div className="absolute flex right-2 bottom-12 sm:bottom-8 z-50 w-max h-max">
                  <div
                    className={`flex-col justify-center items-start sm:px-2 sm:py-2 max-w-max h-full bg-secondary-900 bg-opacity-80 rounded-full ${
                      controlsVisible || isVideoPaused ? "flex" : "hidden"
                    }`}
                  >
                    <IconButton onClick={() => setIsVideoMuted(!isVideoMuted)}>
                      {isVideoMuted ? (
                        <span className="icon-[solar--muted-bold] h-6 w-6 text-whites-40 hover:text-whites-40"></span>
                      ) : (
                        <span className="icon-[solar--volume-loud-bold] h-6 w-6 text-whites-40 hover:text-whites-40"></span>
                      )}
                    </IconButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    

      {/** Other details */}
      <div className="flex px-4 py-6 gap-2 flex-col w-full h-full">
        <Typography className="font-[Inter-Bold] line-clamp-1 md:line-clamp-0 text-2xl md:text-5xl text-whites-40 select-none">
          {filmData?.title}
        </Typography>
        <div className="flex flex-row gap-2 w-full">
          <Typography className="font-[Inter-Regular] line-clamp-1 md:line-clamp-0 text-lg md:text-2xl text-whites-40 select-none">
            {filmData?.yearOfProduction}
          </Typography>
          {filmData?.type?.toLowerCase()?.includes("series") ||
          filmData?.type?.toLowerCase()?.includes("segment") ? (
            <Typography className="font-[Inter-Regular] line-clamp-1 md:line-clamp-0 text-lg md:text-2xl text-whites-40 select-none">
              {filmData?.season?.length}{" "}
              {filmData?.season?.length > 2 ? "Segments" : "Segment"}
            </Typography>
          ) : null}
        </div>

        {/** watch button */}
        {!filmData?.type?.toLowerCase()?.includes("series") && (
          <>
            {filmData?.access?.toLowerCase()?.includes("free") ? (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={handleWatchVideo}
                  className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
                >
                  <span className="icon-[solar--play-bold] h-6 w-6 text-secondary-900"></span>
                  <Typography className="font-[Inter-Bold] text-base">
                    Watch
                  </Typography>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {!videoPurchased ? (
                  <Button
                    onClick={handlePaymentModel}
                    className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
                  >
                    <span className="icon-[solar--play-bold] h-6 w-6 text-secondary-900"></span>
                    <Typography className="font-[Inter-Bold] text-base">
                      Pay to Watch
                    </Typography>
                  </Button>
                ) : (
                  <Button
                    onClick={handleWatchVideo}
                    className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
                  >
                    <span className="icon-[solar--play-bold] h-6 w-6 text-secondary-900"></span>
                    <Typography className="font-[Inter-Bold] text-base">
                      Watch
                    </Typography>
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/** ploat summary && cast & directors */}
        <div className="flex flex-col gap-4 w-full">
          <p className=" font-[Inter-Regular] text-whites-100 text-sm md:text-base text-ellipsis  select-none">
            <TextClamped
              text={
                filmData?.type?.includes("film") ||
                filmData?.type?.includes("series")
                  ? filmData?.plotSummary
                  : filmData?.overview
              }
              lines={3}
            />
          </p>

          <div className="flex flex-col gap-1 w-full">
            {filmData?.cast?.length > 0 && (
              <div>
                <Typography className="flex gap-2 font-[Inter-Regular] text-whites-100 text-sm md:text-base text-ellipsis text-opacity-30 select-none">
                  Cast:{" "}
                  <ul className="flex flex-wrap">
                    {filmData?.cast?.map((data, index) => (
                      <li key={index} className="w-max font-[Inter-Regular]">
                        {(index ? ", " : "") + data}
                      </li>
                    ))}
                  </ul>
                </Typography>
              </div>
            )}

            {filmData?.directors?.length > 0 && (
              <div>
                <Typography className="flex gap-2 font-[Inter-Regular] text-whites-100 text-sm md:text-base text-ellipsis text-opacity-30 select-none">
                  Directors:{" "}
                  <ul className="flex flex-wrap">
                    {filmData?.directors?.map((data, index) => (
                      <li key={index} className="w-max font-[Inter-Regular]">
                        {(index ? ", " : "") + data}
                      </li>
                    ))}
                  </ul>
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/** like buttons */}
        <div className="flex flex-row gap-2 w-full">
          {includedInWatchlist ? (
            <Button
              onClick={handleAddToWatchlist}
              className="flex w-full px-8 py-2 items-center border-2 border-primary-500  justify-center space-x-2 rounded-lg relative text-secondary-900 bg-secondary-300"
            >
              <span className="icon-[solar--bookmark-circle-broken] h-6 w-6 text-whites-40"></span>
            </Button>
          ) : (
            <Button
              onClick={handleAddToWatchlist}
              className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
            >
              <span className="icon-[solar--bookmark-circle-broken] h-6 w-6 text-secondary-900"></span>
            </Button>
          )}

          {filmData?.likes[0]?.type === "THUMBS_UP" ? (
            <Button
              disabled={rateMutation.isPending ? true : false}
              onClick={() => handleLikes("none")}
              className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 border-2 border-primary-500 bg-secondary-300"
            >
              <span className="icon-[solar--like-broken] h-6 w-6 text-whites-40"></span>
            </Button>
          ) : (
            <Button
              disabled={rateMutation.isPending ? true : false}
              onClick={() => handleLikes("like")}
              className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
            >
              <span className="icon-[solar--like-broken] h-6 w-6 text-secondary-900"></span>
            </Button>
          )}
          {filmData?.likes[0]?.type === "THUMBS_DOWN" ? (
            <Button
              disabled={rateMutation.isPending ? true : false}
              onClick={() => handleLikes("none")}
              className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 border-2 border-primary-500 bg-secondary-300"
            >
              <span className="icon-[solar--dislike-broken] h-6 w-6 text-whites-40"></span>
            </Button>
          ) : (
            <Button
              disabled={rateMutation.isPending ? true : false}
              onClick={() => handleLikes("dislike")}
              className="flex w-full px-8 py-2 items-center justify-center space-x-2 rounded-lg relative text-secondary-900 bg-whites-40"
            >
              <span className="icon-[solar--dislike-broken] h-6 w-6 text-secondary-900"></span>
            </Button>
          )}
        </div>

        {videoPurchaseData?.length > 0 && (
          <GetRemainingDays expiryDate={videoPurchaseData[0]?.expiresAt} />
        )}
      </div>

      {/** loader */}
      {rateMutation.isPending ||
      addToWatchlistMutation.isPending ||
      removeFromWatchlistMutation.isPending ? (
        <div className="absolute flex w-full h-full items-center justify-center">
          <CustomLoader />
        </div>
      ) : null}
    </div>
  );
};

export default UMobileHero;
