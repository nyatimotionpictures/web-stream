import { Box, Slider, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import Button from "../../../2-Components/Buttons/Button";
import PlayerControls from "./PlayerControls";
import formatDuration from "./formatDuration";
import { BaseUrl } from "../../../3-Middleware/apiRequest";
import { useGetVideoSource } from "../../../5-Store/TanstackStore/services/queries";
import { useNavigate } from "react-router-dom";
// import videoFilm from "./Bugisu Teaser.mp4";
import { Player } from "video-react";
import "video-react/dist/video-react.css";

const TestPlayerCaptions = ({
    videoSrc,
    filmData,
    allVideos,
    handleResolution,
  }) => {

    const videoRef = useRef(null);
 
  let playerContainerRef = useRef(null);
  let progressRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [volumestate, setVolumeState] = React.useState(40);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);

  const [currentTime, setCurrentTime] = useState(
    videoSrc?.currentTime ? videoSrc?.currentTime : 0
  );
  const [duration, setDuration] = useState(0);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = React.useRef(null);
  const [controlsVisible, setControlsVisible] = React.useState(false);
  let navigate = useNavigate();
  const playerRef = useRef(null);


  React.useEffect(() => {
    if (playerRef.current) {
      const videoElement = playerRef.current.video.video;
      const textTracks = videoElement.textTracks;

      // Set default track mode to "hidden"
      Array.from(textTracks).forEach((track) => (track.mode = "hidden"));

      // Enable the first subtitle track by default
      if (textTracks.length > 0) {
        textTracks[0].mode = "showing";
      }
    }
  }, []);

  const toggleSubtitles = (index) => {
    if (playerRef.current) {
      const textTracks = playerRef.current.video.video.textTracks;
      console.log(textTracks)

      // Hide all tracks first
      Array.from(textTracks).forEach((track) => (track.mode = "hidden"));

      // Show the selected track
      if (index !== null && textTracks[index]) {
        textTracks[index].mode = "showing";
      }
    }
  };

  

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

  //let getVideoSource = useGetVideoSource(videoSrc?.id);
  //console.log("getVideoSource", getVideoSource);
  const handleBack = () => {
    videoRef.current.currentTime -= 10; // Go back 10 seconds
    setCurrentTime(currentTime - 10);
  };

  const handleFront = () => {
    videoRef.current.currentTime += 10; // Go back 10 seconds
    setCurrentTime(currentTime + 10);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  // const handleProgressClick = (e) => {
  //   console.log(e);
  //   console.log("clicked", progressRef?.current);
  //   console.log("normal", e.nativeEvent.offsetX);
  //   const progressWidth = e.target.clientWidth;
  //   const clickPosition = e.nativeEvent.offsetX;
  //   const newTime = (clickPosition / progressWidth) * duration;
  //   videoRef.current.currentTime = newTime;
  // };

  const togglePlayPause = () => {
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleLoadedData = (e) => {
    setDuration(videoRef?.current?.duration);
    videoRef.current.currentTime = videoSrc?.currentTime
      ? videoSrc?.currentTime
      : 0;
  };

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

  const toggleCaptions = () => {
    if (videoRef.current) {
      const textTracks = videoRef.current.textTracks;
      console.log("textTracks", videoRef.current);

      console.log("textTracks", textTracks);
      if (textTracks && textTracks.length > 0) {
        const track = textTracks[0]; // Access the first track
        track.mode = track.mode === "showing" ? "hidden" : "showing";
      }
    }
  };
  // console.log("videoSrc", videoSrc);
  // console.log("allVideos", allVideos);
  return (
    <div className="video-player-container flex flex-col my-0 justify-center mx-auto">
                <Player
        ref={playerRef}
        controls
        src={videoFilm} 
       
      />
     <div className="subtitle-controls">
        <label htmlFor="subtitle-select">Subtitles:</label>
        <select
          id="subtitle-select"
          onChange={(e) =>
            toggleSubtitles(e.target.value ? parseInt(e.target.value) : null)
          }
        >
          <option value="">None</option>
          <option value="0">English</option>
          <option value="1">French</option>
          {/* Add more options based on your video tracks */}
        </select>
      </div>

      <div
      onMouseMove={handleMouseMove}
        ref={playerContainerRef}
        className="flex bg-secondary-900  items-center justify-center h-screen w-[100%] relative"
      >
        <div className="flex w-full h-[100vh]">
        <Player
        ref={playerRef}
        controls
        src={"https://newtou.nyc3.digitaloceanspaces.com/6756d0ab60e2443d0b6bbe9c/trailer-2.-review-of-map-statements.mp4"} 
      />
          {/* <video
            ref={videoRef}
            preload="metadata"
            className="video-player w-full h-full"
            onTimeUpdate={handleTimeUpdate}
          
            // src={videoSrc && videoSrc?.id ? `${BaseUrl}/v1/film/stream/${videoSrc?.id}` : null}
            onProgress={handleBufferedProgress}
            onLoadedData={handleLoadedData}
            muted={isVideoMuted}
            onWaiting={handleBuffering}
            // onPlaying={handleOnPlayingvideoSrc && videoSrc?.id ? videoSrc?.url : nul}
            //onPlay={handleVideoPlayed}
            //onPause={handleVideoPaused}
          >

            <source   src={"https://newtou.nyc3.digitaloceanspaces.com/6756d0ab60e2443d0b6bbe9c/trailer-2.-review-of-map-statements.mp4"} type="video/mp4" />
          </video> */}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-12 h-12 border-4 border-t-transparent border-whites-40 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/** All controls */}
        {
          controlsVisible || videoRef?.current?.paused ? (
            <div className="absolute hover:bg-secondary-900 hover:bg-opacity-35 top-0 flex  flex-col justify-center items-center w-full h-[100vh]">
            {/** backshadow */}
            {/* <Box className="w-screen h-screen absolute top-0 hover:bg-[red] hover:bg-opacity-35" /> */}
            {/** title */}
            <div className="video-title absolute top-0 w-full flex flex-col gap-1 items-start px-4 py-4 max-h-[75px]">
              <div onClick={() => navigate(-1)} className=" flex flex-row items-center gap-2">
                <span className="icon-[solar--arrow-left-linear] h-6 w-6  text-whites-40"></span>
                <Typography className="font-[Roboto-Bold] text-xl text-whites-40 ">
                  {filmData?.title}
                </Typography>
              </div>
              {!filmData?.type?.toLowerCase()?.includes("series") &&
              !filmData?.type?.toLowerCase()?.includes("movie") ? (
                <Typography className="font-[Roboto-Regular] pl-4 text-base text-whites-40 ">
                  {filmData?.seasonData?.title} S{filmData?.seasonData?.season} -
                  E{filmData?.episode}
                </Typography>
              ) : null}
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
              <div className="w-full flex flex-row justify-between items-center ">
              <div className="flex flex-row gap-4 items-center">
        {/** Play btn */}
        {isVideoPlaying ? (
          <Button
            onClick={togglePlayPause}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--pause-bold] h-6 w-6  text-whites-40"></span>
          </Button>
        ) : (
          <Button
            onClick={togglePlayPause}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--play-bold] h-6 w-6  text-whites-40"></span>
          </Button>
        )}

        <Button
          onClick={replayVideo}
          className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
        >
          <span className="icon-[solar--restart-bold] h-6 w-6  text-whites-40"></span>
        </Button>

        <div className="flex flex-row items-center gap-2 md:gap-4">
          {/** volume slider */}
          <div className="flex flex-row gap-1 sm:gap-4 items-center">
            <Button
              onClick={handleMuteVideo}
              className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
            >
              {volumestate >= 80 && !isVideoMuted && (
                <span className="icon-[solar--volume-loud-bold] h-6 w-6  text-whites-40"></span>
              )}
              {volumestate < 80 && volumestate >= 30 && !isVideoMuted && (
                <span className="icon-[solar--volume-small-bold] h-6 w-6  text-whites-40"></span>
              )}
              {volumestate < 30 && volumestate >= 1 && !isVideoMuted && (
                <span className="icon-[solar--volume-bold] h-6 w-6  text-whites-40"></span>
              )}

              {volumestate <= 0 || isVideoMuted ? (
                <span className="icon-[solar--muted-bold] h-6 w-6  text-whites-40"></span>
              ) : null}
            </Button>

           
          </div>
          {/** timeline */}
          
        </div>

        <div>
        <Button
            onClick={toggleCaptions}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[bx--captions] h-6 w-6  text-whites-40"></span>
          </Button>

        </div>
      </div>
              </div>
                {/* <PlayerControls
                  videoRef={videoRef}
                  togglePlayPause={togglePlayPause}
                  currentTime={currentTime}
                  duration={duration}
                  isVideoPlaying={isVideoPlaying}
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
                /> */}
              </div>
            </div>
          </div>
          ): null
        }
      
      </div>
    </div>
  
  )
}

export default TestPlayerCaptions