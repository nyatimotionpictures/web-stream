import React from 'react'
import Button from '../../../2-Components/Buttons/Button'
import { Slider, Typography } from '@mui/material'
import formatDuration from './formatDuration'
import { Menu, MenuItem } from "@mui/material";

const PlayerControls = ({togglePlayPause,  duration, currentTime, isVideoPlaying,handleFullScreen, isFullScreen,replayVideo,handleVolumeChange,volumestate, handleMuteVideo, isVideoMuted, allVideos, handleResolution, videoSrc }) => {
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
      handleResolution(video);
      setAnchorEl(null);
    };


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
       
        <Button onClick={handleSettingsClick} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
          <span className="icon-[solar--settings-bold] h-6 w-6  text-whites-40"></span>
        </Button>

        {/** settings menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={() => handleResolutionChange(allVideos[0])}>SD</MenuItem>
          <MenuItem onClick={() => handleResolutionChange(allVideos[1])}>HD</MenuItem>
          <MenuItem onClick={() => handleResolutionChange(allVideos[2])}>FHD</MenuItem>
          <MenuItem onClick={() => handleResolutionChange(allVideos[3])}>UHD</MenuItem>
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