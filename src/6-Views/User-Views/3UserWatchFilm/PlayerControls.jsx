import React, { useEffect } from 'react'
import Button from '../../../2-Components/Buttons/Button'
import { Slider, Typography } from '@mui/material'
import formatDuration from './formatDuration'
import { Menu, MenuItem } from "@mui/material";
import { current } from '@reduxjs/toolkit';

const PlayerControls = ({videoRef, togglePlayPause,  duration, currentTime, isVideoPlaying,handleFullScreen, isFullScreen,replayVideo,handleVolumeChange,volumestate, handleMuteVideo, isVideoMuted, allVideos, handleResolution, videoSrc,setIsLoading }) => {
  //  const [volumestate, setVolumeState] = React.useState(40);
  const [anchorEl, setAnchorEl] = React.useState(null);
   const isMenuOpen = Boolean(anchorEl);
    let volumeRef = React.useRef()

    React.useEffect(()=>{

    },[])

    // const handleVolumeChange = (e) => {
    //     setVolumeState(e.target.value)
    // }

    const handleSettingsClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
  
    const handleResolutionChange = (video) => {
      if(videoRef.current){

        const currentTime = videoRef.current.currentTime; // Save current time
        const isPlaying = !videoRef.current.paused;

        handleResolution(video);
        setIsLoading(true);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.currentTime = currentTime; // Restore playback time
          if (isPlaying) videoRef.current.play(); // Resume playback if it was playing
          setIsLoading(false);
        };
      }
      
      setAnchorEl(null);
    };

    useEffect(() => {
      if (allVideos.length > 0) {
        const order = ["SD", "HD", "FHD", "UHD"];
        allVideos.sort(
          (a, b) => order.indexOf(a.resolution) - order.indexOf(b.resolution)
        );
      }
  
      return () => {
       
      };
    }, [allVideos]);

  return (
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

            <div className="flex w-[90px] text-whites-40">
              <Slider
                ref={volumeRef}
                value={volumestate}
                onChange={handleVolumeChange}
                color="#f2f2f2"
              />
            </div>
          </div>
          {/** timeline */}
          <Typography className="text-whites-40 font-[Roboto-Regular] hidden sm:flex md:text-base">
            {formatDuration(currentTime) ?? "0:00"} /{" "}
            {formatDuration(duration) ?? "0:00:00"}
          </Typography>
        </div>
      </div>

      {/** settings & resize */}
      <div className="flex flex-row gap-4 items-center">
       
        <Button id="basic-button" aria-controls={isMenuOpen ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={isMenuOpen ? 'true' : undefined} onClick={handleSettingsClick} className="basic-button flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40 relative ">
          <span className="icon-[solar--settings-bold] h-6 w-6  text-whites-40"></span>
          <div className='absolute -top-2 -right-2 w-max h-max flex flex-col justify-center items-center px-1 py-1 bg-opacity-90 bg-primary-500 rounded-full'><span className=" text-whites-40 text-[9px] font-[Inter-Bold] uppercase">
            {
              videoSrc?.resolution
            }
            </span></div>
        </Button>

        {/** settings menu */}
        <Menu
        id="basic-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {
            allVideos.map((data, index) => {
              return (
                <MenuItem key={index} onClick={() => handleResolutionChange({...data, currentTime: currentTime})}>{data.resolution}</MenuItem>
              );
            })
          }
          
        </Menu>
        {/** full screen */}
        <Button
          onClick={handleFullScreen}
          className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
        >
          {isFullScreen ? (
            <span className="icon-[solar--quit-full-screen-linear] h-6 w-6  text-whites-40"></span>
          ) : (
            <span className="icon-[solar--full-screen-linear] h-6 w-6  text-whites-40"></span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PlayerControls