import React from "react";
// import posterImage from "../../1-Assets/images/Movie poster/Movie poster.svg";
import styled from "styled-components";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import posterImage from "../../1-Assets/Posterimage.png";

const MovieCard3 = ({ data }) => {
  const [isImgBroken, setIsImgBroken] = React.useState(false);
   const [posterlink, setPosterLink] = React.useState("");
  let navigate = useNavigate();

  const handleImgError = () => {
    setIsImgBroken(true);
  };

  //shuffleArray
  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const endItems = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[endItems]] = [
        shuffledArray[endItems],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  React.useEffect(() => {
    if (data?.posters?.length > 0 && data?.posters?.length > 1) {
      let filteredPosters = data?.posters?.filter((data) => {
        if (data.isCover) {
          return data;
        }
      });
      
      const shuffledItems = shuffleArray(filteredPosters);
      let selectedlink = shuffledItems[0];
      setPosterLink(selectedlink);
    } else if (data?.posters?.length > 0 && data?.posters?.length === 1) {
      let selectedlink = data.posters[0];
      setPosterLink(selectedlink);
    } else {
      setPosterLink(() => data?.poster ?? "");
    }
  }, [data]);
  return (
    <MovieContainer
      className={
        "min-h-[250px] h-max w-[152.42px] sm:w-[292px] md:w-[280px] lg:w-[270px] lg:min-h-[510px] 2xl:w-[300px] flex flex-col items-start gap-3 pixelated"
      }
    >
      {/** image */}
      <div className="bg-secondary-200 h-[172.42px] sm:h-[302px] md:h-[280px] lg:h-[310px]  2xl:h-[389px] w-full p-0 m-0 overflow-hidden rounded-tl-lg rounded-tr-lg">
        <img
          onError={handleImgError}
          src={posterlink?.url}
          alt={"movie"}
          className="object-fit h-full w-full"
        />
      </div>

      {/** access type */}
      {

      }
      <Stack className="flex flex-row p-0 m-0 items-center justify-center gap-2 lg:pt-3">
      {
        data?.type !== "series" && (
          <Stack direction="row" className="gap-2">
          {data?.access?.toLowerCase()?.includes("free") ? (
            <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40">
              Free to watch
            </Typography>
          ) : (
            <Stack direction="row" className="gap-2 flex flex-row items-center">
              <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span>
              <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40">
                Rent to watch
              </Typography>
            </Stack>
          )}
        </Stack>
        )
      }
        
      </Stack>
      <div className="flex flex-row space-x-4 items-center">
        <Button className="flex py-2 px-2 rounded-full h-full w-full">
          <span className="icon-[solar--info-circle-outline] h-6 w-6 text-whites-500"></span>
        </Button>

        <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40">
        {data?.yearOfProduction}
        </Typography>
      </div>

      <Typography className="font-[Inter-Medium] line-clamp-4  text-sm sm:text-base 2xl:text-lg text-whites-40">
        {data?.plotSummary}
      </Typography>
    </MovieContainer>
  );
};

export default MovieCard3;

const MovieContainer = styled(Box)`
  &&.pixelated > img {
    image-rendering: pixelated !important;
  }
`;
