import { Box, Slider, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import SeriesPlayerControls from "./SeriesPlayerControls";
import { BaseUrl } from "../../../3-Middleware/apiRequest";
import Button from "../../../2-Components/Buttons/Button";
import formatDuration from "../3UserWatchFilm/formatDuration";
import { useNavigate } from "react-router-dom";
import RemainingFilmDays from "../3UserWatchFilm/RemainingFilmDays";

const SeriesFullCustomPlayer = ({
  filmData,
  allVideos,
  videoSrc,
  handleResolution,
  episodeIndex,
  handleNextEpisode,
  allEpisodes,
  purchasedData,
}) => {
  const videoRef = useRef(null);
  let playerContainerRef = useRef(null);
  let navigate = useNavigate();
  const episodeKey = `episode_${filmData?.id}_time`;

  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [volumestate, setVolumeState] = React.useState(40);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = React.useRef(null);
  const [controlsVisible, setControlsVisible] = React.useState(false);

  useEffect(() => {
    const savedTime = localStorage.getItem(episodeKey);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [videoSrc, filmData?.id]);

  //pointer inactivity
  const handleMouseMove = () => {
    if (!controlsVisible) {
      setControlsVisible(true);
      playerContainerRef?.current?.classList?.remove("cursor-none");
      videoRef?.current?.classList?.remove("cursor-none");
    }
    resetInactivityTimeout();
  };

  const resetInactivityTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
      playerContainerRef?.current?.classList?.add("cursor-none");
      videoRef?.current?.classList?.add("cursor-none");
    }, 3000);
  };

  React.useEffect(() => {
    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);

      resetInactivityTimeout();
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        playerContainerRef?.current?.classList?.remove("cursor-none");
        videoRef?.current?.classList?.remove("cursor-none");
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, []);

  //backBtn handler
  const handleBack = () => {
    videoRef.current.currentTime -= 10; // Go back 10 seconds
    setCurrentTime(currentTime - 10);
  };

  const handleFront = () => {
    videoRef.current.currentTime += 10; // Go back 10 seconds
    setCurrentTime(currentTime + 10);
  };

  const handleTimeUpdate = () => {
    localStorage.setItem(episodeKey, videoRef.current.currentTime);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  const togglePlayPause = () => {
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleLoadedData = (e) => {
    setIsLoading(false);
    // console.log("loadedData", e.target)
    const savedTime =
      localStorage.getItem(episodeKey) ?? videoRef.current.currentTime;

    setCurrentTime(parseFloat(savedTime));
    setDuration(videoRef?.current?.duration);
  };

  //player controls
  const handleSliderChange = (e, value) => {
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleMuteVideo = () => {
    setIsVideoMuted(!isVideoMuted);
  };

  const handleVolumeChange = (e) => {
    //  console.log(videoRef.current.volume)
    e.preventDefault();
    setVolumeState(e.target.value);
    videoRef.current.volume = e.target.value / 100;
  };

  const handleBufferedProgress = () => {
    const bufferedEnd = videoRef.current.buffered.length
      ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      : 0;
    const loaded = (bufferedEnd / duration) * 100;
    setLoadedPercentage(loaded || 0);
  };

  //handle fullscreen
  const handleFullScreen = () => {
    if (playerContainerRef?.current) {
      if (playerContainerRef?.current?.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
      } else if (playerContainerRef?.current?.webkitRequestFullscreen) {
        playerContainerRef?.current?.webkitRequestFullscreen();
      } else if (playerContainerRef?.current?.msRequestFullscreen) {
        playerContainerRef?.current?.msRequestFullscreen();
      } else {
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleExitFullScreen = () => {
    if (playerContainerRef?.current) {
      if (document?.exitFullscreen) {
        document?.exitFullscreen();
      } else if (document?.webkitExitFullscreen) {
        document?.webkitExitFullscreen();
      } else if (document?.msExitFullscreen) {
        document?.msExitFullscreen();
      } else if (document?.mozExitFullscreen) {
        document?.mozExitFullscreen();
      } else {
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  //handle replay
  const replayVideo = () => {
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleBuffering = () => {
    setIsLoading(true); // Show loader during buffering
  };

  const handleOnPlaying = () => {
    setIsLoading(false); // Hide loader after playback
  };

    // Handle episode end
    const handleVideoEnd = () => {
      if (allEpisodes[episodeIndex + 1] !== undefined) {
        // setCurrentEpisodeIndex(currentEpisodeIndex + 1);
        handleNextEpisode(episodeIndex + 1)
        localStorage.removeItem(episodeKey);
      } else {
        setIsVideoPlaying(false);
        videoRef.current.pause();
        //setIsVideoEnded(true); // No more episodes, mark video as ended
        localStorage.removeItem(episodeKey);
      }
    };

  React.useEffect(() => {
    if (videoRef?.current) {
      screen?.orientation.lock("landscape-primary");
      videoRef?.current?.addEventListener("orientationchange", () => {
        if (videoRef?.current) {
          videoRef.current.play();
        }
      });
    }
  }, []);

  return (
    <div className="video-player-container flex flex-col my-0 justify-center mx-auto">
      <div
        onMouseMove={handleMouseMove}
        ref={playerContainerRef}
        className="flex bg-secondary-900  items-center justify-center h-screen w-[100%] relative"
      >
        <div className="flex w-full h-[100vh]">
          <video
            ref={videoRef}
            preload="auto"
            // preload="metadata"
            className="video-player w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            src={videoSrc && videoSrc?.id ? videoSrc?.url : null}
            // src={videoSrc && videoSrc?.id ? `${BaseUrl}/v1/film/stream/${videoSrc?.id}?currentTime=${currentTime}` : null}
            // src={videoSrc && videoSrc?.id ? `${BaseUrl}/v1/film/stream/${videoSrc?.id}` : null}
            onProgress={handleBufferedProgress}
            onLoadedData={handleLoadedData}
            muted={isVideoMuted}
            onWaiting={handleBuffering}
            onPlaying={handleOnPlaying}
            onEnded={handleVideoEnd}
            //onPlay={handleVideoPlayed}
            //onPause={handleVideoPaused}
          ></video>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-12 h-12 border-4 border-t-transparent border-whites-40 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/** All controls */}
        {controlsVisible || videoRef?.current?.paused ? (
          <div className="absolute hover:bg-secondary-900 hover:bg-opacity-35 top-0 flex  flex-col justify-center items-center w-full h-[100vh]">
            {/** backshadow */}
            {/* <Box className="w-screen h-screen absolute top-0 hover:bg-[red] hover:bg-opacity-35" /> */}
            {/** title */}
            <div className="video-title absolute top-0 w-full flex flex-col gap-1 items-start px-4 py-4 max-h-[75px]">
              <div
                onClick={() => navigate(-1)}
                className=" flex flex-row items-center gap-2"
              >
                <span className="icon-[solar--arrow-left-linear] h-6 w-6  text-whites-40"></span>
                <Typography className="font-[Roboto-Bold] text-xl text-whites-40 ">
                  {filmData?.title}
                </Typography>
              </div>
            </div>

            {/** Play Buttons */}
            <div className="flex flex-row items-center justify-center w-full gap-4">
              {/** rewind */}
              <Button
                onClick={handleBack}
                className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-whites-40 hover:bg-opacity-40 "
              >
                <span className="icon-[solar--rewind-10-seconds-back-bold] h-8 w-8  text-whites-40"></span>
              </Button>
              {/** play */}
              <Button
                onClick={togglePlayPause}
                className="flex w-max h-max p-3 rounded-full bg-opacity-40 bg-whites-40 hover:bg-whites-40 hover:bg-opacity-60 relative "
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full h-full border-4 border-t-transparent border-primary-500 rounded-full animate-spin">
                      {" "}
                    </div>
                  </div>
                )}

                {isVideoPlaying ? (
                  <span className="icon-[solar--pause-bold] h-6 w-6  text-whites-50"></span>
                ) : (
                  <span className="icon-[solar--play-bold] h-6 w-6  text-whites-50"></span>
                )}
              </Button>
              {/** fast forward */}
              <Button
                onClick={handleFront}
                className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-whites-40 hover:bg-opacity-40  "
              >
                <span className="icon-[solar--rewind-10-seconds-forward-bold] h-8 w-8  text-whites-40"></span>
              </Button>
            </div>

            {/** Progress bar */}
            <div className="controls absolute bottom-2 max-h-full flex flex-col gap-2 items-center w-full px-4 py-2 ">
              <Typography className="text-whites-40 font-[Roboto-Regular] justify-start w-full flex sm:hidden md:text-base">
                {formatDuration(currentTime) ?? "0:00"} /{" "}
                {formatDuration(duration) ?? "0:00:00"}
              </Typography>

              <div className="flex w-full relative ">
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    width: `${loadedPercentage}%`,
                    height: "4px",
                    backgroundColor: "rgba(200,200,200,0.6)",
                    borderRadius: "4px",
                    transform: "translateY(-50%)",
                  }}
                />

                <Slider
                  size="small"
                  step={0.1}
                  onChange={handleSliderChange}
                  value={currentTime}
                  min={0}
                  max={duration}
                  sx={{
                    "& .MuiSlider-thumb": {
                      color: "#fff",
                    },
                    "& .MuiSlider-track": {
                      color: "#f2f2f2",
                    },
                    "& .MuiSlider-rail": {
                      color: "rgba(255,255,255,0.4)",
                    },
                  }}
                />
              </div>

              {/** Buttons */}
              <div className="w-full">
                <SeriesPlayerControls
                  videoRef={videoRef}
                  togglePlayPause={togglePlayPause}
                  currentTime={currentTime}
                  duration={duration}
                  isVideoPlaying={isVideoPlaying}
                  setIsVideoPlaying={setIsVideoPlaying}
                  handleFullScreen={handleFullScreen}
                  isFullScreen={isFullScreen}
                  replayVideo={replayVideo}
                  handleVolumeChange={handleVolumeChange}
                  volumestate={volumestate}
                  handleMuteVideo={handleMuteVideo}
                  isVideoMuted={isVideoMuted}
                  allVideos={allVideos}
                  handleResolution={handleResolution}
                  videoSrc={videoSrc}
                  setIsLoading={setIsLoading}
                  handleExitFullScreen={handleExitFullScreen}
                  handleNextEpisode={handleNextEpisode}
                  episodeIndex={episodeIndex}
                  allEpisodes={allEpisodes}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {purchasedData?.length > 0 && (
        <RemainingFilmDays
          videoRef={videoRef}
          expiryDate={purchasedData[0]?.expiresAt}
        />
      )}
    </div>
  );
};

export default SeriesFullCustomPlayer;
