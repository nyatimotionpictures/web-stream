import { Stack, Typography } from '@mui/material'
import React from 'react'
import Button from '../Buttons/Button'
import { useNavigate } from 'react-router-dom'

const SegmentCard = ({
    seasondata,
}) => {
 let navigate = useNavigate()
    let ref = React.useRef();
  return (
    <Stack
    onClick={() =>
        navigate(`/segments/${seasondata?.id}/${seasondata?.filmId}`)

    }
    className="flex-col md:flex-row w-full xs:w-[280px] gap-6 sm:w-full h-max justify-start items-start"
    ref={ref}
    // onMouseEnter={onMouseEnter}
    // onMouseLeave={onMouseLeave}
  >
    <div className="flex justify-start  items-start w-full sm:w-max h-max ">
      <img
        src={
            seasondata?.posters?.length > 0 ? episodedata?.posters[0]?.url : ""
        }
        alt=""
        //w-[280px] 
        className="size-fit sm:size-fill w-full h-[250px] sm:w-[338px] sm:max-w-[338px] max-h-[250px] !object-cover mx-0 my-0 rounded-lg md:!w-[338px] xl:object-top xl:size-fit"
      />
    </div>

    <Stack spacing={"30px"} className="sm:w-[300px] md:w-full">
      <Stack>
        <Typography className="font-[Inter-SemiBold] text-base md:text-xl text-whites-40">
          {`S${seasondata?.season}`}{" "}
         
          { seasondata?.title}
        </Typography>
        <Typography className="font-[Inter-Regular] text-[14px] md:text-base text-[#FFFAF6] text-opacity-70">
          { seasondata?.released}
        </Typography>
        <Typography className="line-clamp-5 font-[Inter-Regular] text-sm md:text-base text-[#FFFAF6] text-opacity-70 text-justify">
          { seasondata?.plotSummary}
        </Typography>
      </Stack>
      <Stack spacing={"24px"}>
        <Stack spacing={"20px"} className="flex flex-row">
          <Button
            onClick={() =>
                navigate(`/segments/${seasondata?.id}/${seasondata?.filmId}`)

            }
           className="flex w-max px-8 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]"
          >
            <span className="icon-[solar--info-circle-outline] h-6 w-6 text-whites-40"></span>
            <Typography className="font-[Roboto-Regular] text-base">
              More Details
            </Typography>
          </Button>

        </Stack>
      </Stack>
    </Stack>
  </Stack>
  )
}

export default SegmentCard