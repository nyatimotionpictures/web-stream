import { Box, Slider, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import Button from "../../../2-Components/Buttons/Button";
import PlayerControls from "./PlayerControls";
import formatDuration from "./formatDuration";


const FullCustomPlayer = ({ videoSrc, title }) => {
    const videoRef = useRef(null);
    let playerContainerRef = useRef(null)
    let progressRef = useRef(null)
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)
    const [volumestate, setVolumeState] = React.useState(40);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0)
    const [loadedPercentage, setLoadedPercentage] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false)


     const handleBack = () => {
     
        videoRef.current.currentTime -= 10; // Go back 10 seconds
        
        setCurrentTime(currentTime - 10)
       
    };


    const handleFront = () => {
      videoRef.current.currentTime += 10; // Go back 10 seconds
        
        setCurrentTime(currentTime + 10)

     
   };
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    };

    const handleProgressClick = (e) => {
      console.log(e)
      console.log("clicked", progressRef?.current)
      console.log("normal", e.nativeEvent.offsetX)
      const progressWidth = e.target.clientWidth;
      const clickPosition = e.nativeEvent.offsetX;
      const newTime = (clickPosition / progressWidth) * duration;
      videoRef.current.currentTime = newTime;
    };


    const togglePlayPause = () => {
      if (isVideoPlaying){
        videoRef.current.pause()
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying)
    }

    const handleLoadedData = (e) => {
      setDuration(videoRef?.current?.duration);
    }
  

    
    const handleSliderChange = (e, value) => {
     videoRef.current.currentTime =  value;
     setCurrentTime(value)
  }

  const handleVolumeChange = (e) => {
  //  console.log(videoRef.current.volume)
  e.preventDefault()
  setVolumeState(e.target.value)
    videoRef.current.currentVolume = e.target.value;
   
  }

  const handleBufferedProgress = () => {
    const bufferedEnd = videoRef.current.buffered.length ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) : 0;
    const loaded = (bufferedEnd / duration) * 100;
    setLoadedPercentage(loaded || 0)
  }

  //handle fullscreen
  const handleFullScreen = () => {
    if (playerContainerRef?.current){
      if(playerContainerRef?.current?.requestFullscreen){
        playerContainerRef?.current?.requestFullscreen()
      } else if (playerContainerRef?.current?.webkitRequestFullscreen){
        playerContainerRef?.current?.webkitRequestFullscreen()
      } else if (playerContainerRef?.current?.msRequestFullscreen){
        playerContainerRef?.current?.msRequestFullscreen()
      } else {

      }
      setIsFullScreen(!isFullScreen)

    }
  }

  //handle replay
  const replayVideo = () => {
    videoRef.current.currentTime = 0;
    setCurrentTime(0)
  }


    
  return (
    <div className="video-player-container flex flex-col my-0 justify-center mx-auto">
      <div
        ref={playerContainerRef}
        className="flex bg-secondary-900  items-center justify-center h-screen w-[100%] relative"
      >
        <div className="flex w-full h-[100vh]">
          <video
            ref={videoRef}
            className="video-player w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            src={videoSrc}
            onProgress={handleBufferedProgress}
            onLoadedData={handleLoadedData}
            //onPlay={handleVideoPlayed}
            //onPause={handleVideoPaused}
            
          ></video>
        </div>

        {/** All controls */}
        <div  className="absolute hover:bg-secondary-900 hover:bg-opacity-35 top-0 flex  flex-col justify-center items-center w-full h-[100vh]">
          {/** backshadow */}
          {/* <Box className="w-screen h-screen absolute top-0 hover:bg-[red] hover:bg-opacity-35" /> */}
          {/** title */}
          <div className="video-title absolute top-0 w-full flex flex-col gap-1 items-start px-4 py-4 max-h-[75px]">
            <div className=" flex flex-row items-center gap-2">
              <span className="icon-[solar--arrow-left-linear] h-6 w-6  text-whites-40"></span>
              <Typography className="font-[Roboto-Bold] text-xl text-whites-40 ">
                Tuko Pamoja
              </Typography>
            </div>
            <Typography className="font-[Roboto-Regular] pl-4 text-base text-whites-40 ">
              Tuko Pamoja
            </Typography>
          </div>

          {/** Play Buttons */}
          <div className="flex flex-row items-center justify-center w-full gap-4">
            {/** rewind */}
            <Button onClick={handleBack} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-whites-40 hover:bg-opacity-40 ">
              <span className="icon-[solar--rewind-10-seconds-back-bold] h-8 w-8  text-whites-40"></span>
            </Button>
            {/** play */}
            <Button
              onClick={togglePlayPause}
              className="flex w-max h-max p-3 rounded-full bg-opacity-40 bg-whites-40 hover:bg-whites-40 hover:bg-opacity-60  "
            >
              {isVideoPlaying ? (
                <span className="icon-[solar--pause-bold] h-6 w-6  text-whites-50"></span>
              ) : (
                <span className="icon-[solar--play-bold] h-6 w-6  text-whites-50"></span>
              )}
            </Button>
            {/** fast forward */}
            <Button onClick={handleFront} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-whites-40 hover:bg-opacity-40  ">
              <span className="icon-[solar--rewind-10-seconds-forward-bold] h-8 w-8  text-whites-40"></span>
            </Button>
          </div>

          {/** Progress bar */}
          <div className="controls absolute bottom-2 max-h-full flex flex-col gap-2 items-center w-full px-4 py-2 ">
            {/* <button onClick={handleBack}>Back 10s</button> */}
            {/** progress bar */}
            {/* <div
            ref={progressRef}
              className="progress-bar h-[5px] rounded-lg bg-[#ccc] w-full"
              onClick={handleProgressClick}
            >
              <div
              
                className="progress bg-[#4caf50] h-full rounded-lg w-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div> */}
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
              <PlayerControls
                togglePlayPause={togglePlayPause}
                currentTime={currentTime}
                duration={duration}
                isVideoPlaying={isVideoPlaying}
                handleFullScreen={handleFullScreen}
                isFullScreen={isFullScreen}
                replayVideo={replayVideo}
                handleVolumeChange={handleVolumeChange}
                volumestate={volumestate}
                
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullCustomPlayer;