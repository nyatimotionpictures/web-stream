import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Slider, Stack, Typography } from "@mui/material";
import Button from "../../../2-Components/Buttons/Button";
import CustomLoader from "../../../2-Components/Loader/CustomLoader";
import TextClamped from "../../../2-Components/Stacks/TextClamped";
import { useNavigate } from "react-router-dom";
import GetRemainingDays from "./GetRemainingDays";

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
  const [trailerUrl, setTrailerUrl] = React.useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [isVideoPlayed, setIsVideoPlayed] = React.useState(false);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  let navigate = useNavigate();

  const videoRef = React.useRef(null);
  const heroRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  //duration
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedPercentage, setLoadedPercentage] = useState(0);

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  const handleSliderChange = (e, value) => {
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  //disable Controls
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

  // console.log(filmData)

  {
    //Plays the video after the page loads
  }
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // setShowVideo(true);
      setShowVideo(false);
    }, 5000);
    return () => clearTimeout(timer);
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

  const handleOnLoad = (e) => {
    //  console.log("loaded", e.target)
    //setIsVideoPlaying(true)
    setIsVideoLoaded(true);
    videoRef.current.play();
  };

  const handleLoadedData = (e) => {
    setDuration(videoRef?.current?.duration);
  };

  const togglePlayPause = () => {
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleOnEnded = () => {
    setShowVideo(false);
    setIsVideoPlayed(true);
    setIsVideoLoaded(false);
  };

  const handleMuteVideo = () => {
    setIsVideoMuted(!isVideoMuted);
  };

  const handleReplayVideo = () => {
    setIsVideoPlayed(false);
    setShowVideo(true);
  };

  //handle the scroll behaviour
  useEffect(() => {
    const handleScroll = () => {
      if (!videoRef.current || !heroRef.current) return;

      const heroBounds = heroRef.current.getBoundingClientRect();
      const isHeroInView =
        heroBounds.top >= 0 && heroBounds.bottom <= window.innerHeight;

      if (!isHeroInView && !videoRef.current.paused) {
        videoRef.current.pause(); // Pause video when out of view
        setIsVideoPlaying(false);
      } else if (isHeroInView && videoRef.current.paused && showVideo) {
        videoRef.current.play(); // Resume video if it’s back in view
        setIsVideoPlaying(true);
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
      //  removeFromWatchlistMutation.mutate({
      //    filmId: filmData?.id,
      //    userId: currentUserData?.id,
      //  })
      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type: filmData?.type?.includes("film") ? "film" : "season",
      });
    } else {
      addToWatchlistMutation.mutate({
        resourceId: filmData?.id,
        userId: currentUserData?.id,
        type: filmData?.type?.includes("film") ? "film" : "season",
      });
    }
  };



  return (
    <div
      ref={heroRef}
      className="flex flex-col relative lg:hidden w-full h-full"
    >
      {/** Video */}
      <div className="w-full h-full  relative ">
        <div className="flex justify-center items-center  object-cover h-full w-screen md:h-full md:w-full select-none bg-gradient-to-b from-transparent to-secondary-700 overflow-hidden relative ">
          <video
            // poster={backDropUrl ? backDropUrl : ""}
            ref={videoRef}
            autoPlay
            src={trailerUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={handleLoadedData}
            onCanPlay={handleOnLoad}
            onPlay={() => setIsVideoPlaying(true)}
            controls={false}
            onEnded={() => handleOnEnded()}
            muted={isVideoMuted}
            className="flex  object-cover h-full w-screen md:h-full md:w-full select-none bg-gradient-to-b from-transparent to-secondary-700"
          ></video>

          {/** controls */}
          <div
            className={`flex absolute top-0 flex-col justify-end items-flex z-50 w-full h-full ${
              controlsVisible || videoRef?.current?.paused
                ? " bg-secondary-900 bg-opacity-20 "
                : "bg-transparent bg-opacity-80  "
            }  `}
          >
            {/** Play Button */}
            <div className="absolute flex right-0 left-0 bottom-0 top-0 m-auto  z-50 w-max  h-max   ">
              {isVideoLoaded ? (
                <Button
                  onClick={togglePlayPause}
                  className={` flex-col justify-center items-start px-2 py-2  max-w-max h-full bg-secondary-300 bg-opacity-40 rounded-full ${
                    controlsVisible || videoRef?.current?.paused
                      ? "flex"
                      : "hidden"
                  }`}
                >
                  {isVideoPlaying ? (
                    <span className="icon-[solar--pause-bold] h-10 w-10 text-whites-40 hover:text-whites-40"></span>
                  ) : (
                    <span className="icon-[solar--play-bold] h-10 w-10 text-whites-40 hover:text-whites-40"></span>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col justify-center items-start px-2 py-2  max-w-max h-full bg-secondary-900 bg-opacity-80 rounded-full ">
                  {isVideoPlayed ? (
                    <span
                      onClick={handleReplayVideo}
                      className="icon-[solar--restart-bold] h-8 w-8 text-whites-40 hover:text-whites-40"
                    ></span>
                  ) : (
                    <>
                      {/* <span className="icon-[solar--play-bold] h-10 w-10 text-whites-40 hover:text-whites-40"></span> */}

                      <CustomLoader />
                    </>
                  )}
                </div>
              )}
            </div>
            {/** Close Button */}
            <div className="absolute flex right-2 top-2 z-50 w-max  h-max   ">
              <div
                onClick={() => navigate(-1)}
                className="flex flex-col justify-center items-start px-2 py-2 max-w-max h-full bg-secondary-900 bg-opacity-80 rounded-full "
              >
                <span className="icon-[carbon--close] h-6 w-6 text-whites-40 hover:text-whites-40"></span>
              </div>
            </div>

            {/** Mute Button */}
            {!isVideoPlayed && (
              <div className="absolute flex right-2 bottom-8 z-50 w-max  h-max   ">
                <div
                  className={` flex-col justify-center items-start px-2 py-2  max-w-max h-full bg-secondary-900 bg-opacity-80 rounded-full ${
                    controlsVisible || videoRef?.current?.paused
                      ? "flex"
                      : "hidden"
                  } `}
                >
                  {isVideoMuted ? (
                    <span
                      onClick={handleMuteVideo}
                      className="icon-[solar--muted-bold] h-6 w-6 text-whites-40 hover:text-whites-40"
                    ></span>
                  ) : (
                    <span
                      onClick={handleMuteVideo}
                      className="icon-[solar--volume-loud-bold] h-6 w-6 text-whites-40 hover:text-whites-40"
                    ></span>
                  )}
                </div>
              </div>
            )}

            {/** slider Btn */}
            {!isVideoPlayed && (
              <div
                className={`flex right-0 bottom-0  ${
                  controlsVisible
                    ? "bg-secondary-900 bg-opacity-20"
                    : "bg-transparent bg-opacity-20"
                }  z-50 w-full`}
              >
                <Slider
                  size="medium"
                  step={0.1}
                  onChange={handleSliderChange}
                  value={currentTime}
                  min={0}
                  max={duration}
                  sx={{
                    "& .MuiSlider-thumb": {
                      color: "red",
                    },
                    "& .MuiSlider-track": {
                      color: "red",
                    },
                    "& .MuiSlider-rail": {
                      color: "rgba(255,255,255,0.8)",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

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
