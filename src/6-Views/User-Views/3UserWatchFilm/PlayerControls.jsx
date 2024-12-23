import React from 'react'
import Button from '../../../2-Components/Buttons/Button'
import { Slider, Typography } from '@mui/material'
import formatDuration from './formatDuration'

const PlayerControls = ({togglePlayPause,  duration, currentTime, isVideoPlaying,handleFullScreen, isFullScreen,replayVideo,handleVolumeChange,volumestate  }) => {
  //  const [volumestate, setVolumeState] = React.useState(40);
    let volumeRef = React.useRef()

    React.useEffect(()=>{

    },[])

    // const handleVolumeChange = (e) => {
    //     setVolumeState(e.target.value)
    // }


  return (

    <div className="w-full flex flex-row justify-between items-center ">
    <div className="flex flex-row gap-4 items-center">
        {/** Play btn */}
        {
            isVideoPlaying ?  <Button onClick={togglePlayPause} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
            <span className="icon-[solar--pause-bold] h-6 w-6  text-whites-40"></span>
          </Button> :  <Button onClick={togglePlayPause} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
        <span className="icon-[solar--play-bold] h-6 w-6  text-whites-40"></span>
      </Button>
        }
     
     <Button onClick={replayVideo} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
            <span className="icon-[solar--restart-bold] h-6 w-6  text-whites-40"></span>
          </Button>

      <div className='flex flex-row items-center gap-2 md:gap-4'>
        {/** volume slider */}
        <div className='flex flex-row gap-1 sm:gap-4 items-center'>
            <Button className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
            {
                volumestate >= 80 && (
                    <span className="icon-[solar--volume-loud-bold] h-6 w-6  text-whites-40"></span>
                )
            }
            {
                volumestate < 80 && volumestate >= 30 && (
                    <span className="icon-[solar--volume-small-bold] h-6 w-6  text-whites-40"></span> 
                )
            }
            {
                volumestate < 30 && volumestate >= 1 && (

          <span className="icon-[solar--volume-bold] h-6 w-6  text-whites-40"></span>
                )
            }

{
                volumestate <= 0 &&  (

          <span className="icon-[solar--muted-bold] h-6 w-6  text-whites-40"></span>
                )
            }


            </Button>
           


      
         

          <div  className='flex w-[90px] text-whites-40'>
            <Slider  ref={volumeRef} value={volumestate} onChange={handleVolumeChange} color='#f2f2f2' />
          </div>
        </div>
          {/** timeline */}
        <Typography className='text-whites-40 font-[Roboto-Regular] hidden sm:flex md:text-base'>{formatDuration(currentTime) ?? "0:00"} / {formatDuration(duration) ?? "0:00:00"}</Typography>
      </div>
    </div>

      {/** settings & resize */}
    <div className='flex flex-row gap-4 items-center'>
      <Button className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
        <span className="icon-[solar--settings-bold] h-6 w-6  text-whites-40"></span>
      </Button>
      <Button onClick={handleFullScreen} className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  ">
        {
            isFullScreen ?  <span className="icon-[solar--quit-full-screen-linear] h-6 w-6  text-whites-40"></span> :  <span className="icon-[solar--full-screen-linear] h-6 w-6  text-whites-40"></span>
        }
       
      </Button>
    </div>
  </div>
  )
}

export default PlayerControls