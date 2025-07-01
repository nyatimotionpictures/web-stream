import { Stack, Typography } from '@mui/material'
import React from 'react'
import Button from '../Buttons/Button'
import { useNavigate } from 'react-router-dom'
import TextClamped from '../Stacks/TextClamped'

const SegmentCard = ({
    seasondata,
    onOpenTrailer,
}) => {
 let navigate = useNavigate()
    let ref = React.useRef();

    const handleTrailerClick = (e) => {
        e.stopPropagation();
        // Pause all videos on the page
        document.querySelectorAll('video').forEach(v => v.pause());
        const trailerVideo = seasondata.trailers.find(video => video.isTrailer);
        if (onOpenTrailer && trailerVideo?.url) {
            onOpenTrailer(trailerVideo.url);
        }
    };

  return (
    <Stack
    onClick={() =>
        navigate(`/segments/${seasondata?.id}`)
    }
    className="flex-col md:flex-row w-full xs:w-[280px] gap-6 sm:w-full h-max justify-start items-start"
    ref={ref}
  >
    <div className="flex justify-start  items-start w-full sm:w-max h-max ">
      <img
        src={
            seasondata?.posters?.length > 0 ? seasondata?.posters[0]?.url : ""
        }
        alt=""
        className="size-fit sm:size-fill w-full h-[250px] sm:w-[338px] sm:max-w-[338px] max-h-[250px] !object-cover mx-0 my-0 rounded-lg md:!w-[338px] xl:object-top xl:size-fit"
      />
    </div>

    <Stack spacing={"30px"} className="sm:w-[300px] md:w-full">
      <Stack>
        <Typography className="font-[Inter-SemiBold] text-base md:text-xl text-whites-40">
          {`S${seasondata?.season}`} {seasondata?.title}
        </Typography>
        <Typography className="font-[Inter-Regular] text-[14px] md:text-base text-[#FFFAF6] text-opacity-70">
          { seasondata?.released}
        </Typography>
        <Typography className="line-clamp-5 font-[Inter-Regular] text-sm md:text-base text-[#FFFAF6] text-opacity-70 text-justify">
        <TextClamped text={seasondata?.overview} lines={3} /> 
        </Typography>
      </Stack>
      <Stack spacing={"24px"}>
        <Stack spacing={"20px"} className="flex flex-row flex-wrap items-center gap-2 sm:gap-4">
          <Button
            onClick={() =>
                navigate(`/segments/${seasondata?.id}`)
            }
            className="flex items-center justify-center px-4 sm:px-8 py-2 h-12 w-full sm:w-auto min-w-0 sm:min-w-[140px] rounded-full border-2 border-[#706e72] bg-transparent text-[#FFFAF6] font-[Roboto-Regular] text-sm sm:text-base shadow-md transition-all duration-200 hover:bg-[#706e72] hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#706e72] mb-2 sm:mb-0 sm:mr-4"
            style={{ gap: '0.5rem' }}
          >
            <span className="icon-[solar--info-circle-outline] h-6 w-6"></span>
            <Typography className="font-[Roboto-Regular] text-sm sm:text-base">
              More Details
            </Typography>
          </Button>

          {/* Trailer Button */}
          {seasondata?.trailers && seasondata.trailers.some(video => video.isTrailer) && (
            <Button
              onClick={handleTrailerClick}
              className="mt-0 flex items-center justify-center px-4 sm:px-8 py-2 h-12 w-full sm:w-auto min-w-0 sm:min-w-[140px] rounded-full bg-[#FF6B00] text-white font-[Roboto-Regular] text-sm sm:text-base shadow-lg transition-all duration-200 hover:bg-[#ff8c1a] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              style={{ gap: '0.5rem' }}
            >
              <span className="icon-[solar--play-circle-line-duotone] h-6 w-6"></span>
              <Typography className="font-[Roboto-Regular] text-sm sm:text-base">
                Trailer
              </Typography>
            </Button>
          )}

        </Stack>
      </Stack>
    </Stack>
  </Stack>
  )
}

export default SegmentCard