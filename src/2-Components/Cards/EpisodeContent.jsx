//import { Image, Stack } from '@chakra-ui/react';
import { Stack, Typography } from "@mui/material";
import React from "react";

import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";
import TextClamped from "../Stacks/TextClamped";

const EpisodeContent = ({
  seasondata,
  episodedata,
  handlePaymentModel
}) => {
  let navigate = useNavigate();
  const [isPurchased, setIsPurchased] = React.useState(false);

  let ref = React.useRef();

  // console.log(seasondata, episodedata);

React.useEffect(() => {
  // console.log(seasondata);
  // console.log(episodedata)
 
  if (seasondata?.access === "rent") {
    if (seasondata?.videoPurchased) {
  
      setIsPurchased(true);
    }else {
      setIsPurchased(false);
    }
  }else {
    setIsPurchased(true);
  }
  
  }, [seasondata?.videoPurchased]);

  return (
    <Stack
      className="flex-col md:flex-row w-full xs:w-[280px] gap-6 sm:w-full h-max justify-start items-start"
      ref={ref}
    
    >
      <div onClick={() => isPurchased || seasondata.access?.includes('free') ? navigate(`/watch/s/${seasondata?.id}?ep=${episodedata?.id}`) : handlePaymentModel()} className="flex justify-start  items-start w-full sm:max-w-[338px] max-h-[250px] relative rounded-lg overflow-hidden">
        <img
          src={
            episodedata?.posters?.length > 0 ? episodedata?.posters[0]?.url : ""
          }
          alt=""
          //w-[280px]
          className="size-fit sm:size-fill w-full h-[250px] sm:w-[338px] sm:max-w-[338px] max-h-[250px] !object-cover mx-0 my-0 md:!w-[338px] xl:object-top xl:size-fit "
        />

        <div
          className={`absolute w-full h-full flex items-center justify-center bg-secondary-900 bg-opacity-50 top-0 rounded-lg left-0 z-50`}
        >
          {/** play button */}
          <Button className=" z-50 w-max h-max p-0  bg-opacity-60 bg-transparent hover:bg-transparent  ">
            <span className="icon-[solar--play-bold] h-10 w-10 text-whites-40 hover:text-primary-100"></span>
          </Button>
        </div>
      </div>

      <Stack spacing={"30px"} className="sm:w-[300px] md:w-full">
        <Stack>
          <Typography className="font-[Inter-SemiBold] mb-2 text-base md:text-xl text-whites-40">
            {`S${seasondata?.season}`}{" "}
            {episodedata && `E${episodedata?.episode}`} - {episodedata?.title}
          </Typography>
          <Typography className="font-[Inter-Regular] text-[14px] md:text-base text-[#FFFAF6] text-opacity-70">
            {episodedata?.released}
          </Typography>
          <Typography className=" font-[Inter-Regular] text-sm md:text-base text-[#FFFAF6] text-opacity-70 text-justify">
            <TextClamped text={episodedata?.plotSummary} lines={3} />
          </Typography>
        </Stack>
       
      </Stack>
    </Stack>
  );
};

export default EpisodeContent;
