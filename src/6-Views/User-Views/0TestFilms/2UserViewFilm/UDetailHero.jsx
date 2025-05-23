import React, { useEffect } from "react";
import styled from "styled-components";
import { Box, Stack, Typography } from "@mui/material";
import Button from "../../../../2-Components/Buttons/Button";

import { Player } from "video-react";
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
  const [isVideoMuted, setIsVideoMuted] = React.useState(true);
  const [timer, setTimer] = React.useState(null);
  const videoRef = React.useRef(null);
  const heroRef = React.useRef(null);

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

  const handleOnLoad = (e) => {
    // console.log("loaded", e.target)
    //setIsVideoPlaying(true)
    videoRef.current.play();
  };

  const handleOnEnded = () => {
    setShowVideo(false);
    setIsVideoPlayed(true);
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
      } else if (isHeroInView && videoRef.current.paused && showVideo) {
        videoRef.current.play(); // Resume video if it’s back in view
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
            autoPlay
            src={trailerUrl}
            playsInline
            onLoadedData={handleOnLoad}
            onCanPlay={handleOnLoad}
            controls={false}
            onEnded={() => handleOnEnded()}
            muted={isVideoMuted}
            className="flex  object-cover h-full w-screen md:h-full md:w-full select-none bg-gradient-to-b from-transparent to-secondary-700"
          ></video>
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

const HeroContent = styled.div``;
