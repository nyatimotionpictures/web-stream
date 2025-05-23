import React from "react";
// import posterImage from "../../1-Assets/images/Movie poster/Movie poster.svg";
import styled from "styled-components";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import noImage from "../../1-Assets/no-image.svg";
import ImageLoad from "../Loader/ImageLoad";


const  MovieCard4 = ({data, cardType}) => {
  const [isImgBroken, setIsImgBroken] = React.useState(false);
  const [posterlink, setPosterLink] = React.useState("");
  let navigate = useNavigate();

  const handleImgError = () => {
    setIsImgBroken(true);
  };

  // console.log(data);

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
  // className={
  //   "min-h-[250px] h-max w-[152.42px] sm:w-[292px] md:w-[280px] lg:min-h-[510px] 2xl:w-[300px] flex flex-col items-start gap-3 pixelated"
  // }
   
  return (
    <MovieContainer
      onClick={() =>
        data?.type.includes("film") || data?.type.includes("movie")
          ? navigate(`/film/${data?.id}`)
          : data?.type.includes("series")
          ? navigate(`/series/${data?.id}`)
          : data?.type.includes("episode")
          ? navigate(
              `/episode/${data?.id}/${data?.seasonId}/${data?.seasonData?.season}`
            )
          : data?.type?.includes("season")
          ? navigate(`/segments/${data?.id}`)
          : navigate(`/segments/${data?.id}`)
      }
      className={
        "min-h-[250px] h-max w-full  lg:min-h-[310px]  max-w-[350px] flex flex-col items-start gap-3 pixelated "
      }
    >
      <div className="bg-secondary-200 h-[172.42px] sm:h-[302px] md:h-[280px] lg:h-[310px] 2xl:h-[389px] w-full p-0 m-0 overflow-hidden md:rounded-tl-md md:rounded-tr-md ">
        <ImageLoad
          onError={handleImgError}
          imageData={{
            alt: data?.title,
            className: "size-fit  h-full w-full",
            src: posterlink?.url ? posterlink?.url : data?.posters?.[0]?.url,
          }}
        />
        {/* <img
          onError={handleImgError}
          src={isImgBroken ? noImage : posterlink?.url ? posterlink?.url : data?.posters?.[0]?.url}
          alt={data?.title}
          className=" size-fit object-cover  h-full w-full "
        /> */}
      </div>

      
        <>
        <div>
            <Typography className="font-[Inter-Medium] text-sm sm:text-base lg:text-lg text-whites-40">
              {data?.title}
            </Typography>
          </div>
        
          

{
  cardType !== "watchlist" && (
    <div className="flex flex-row space-x-10 items-center">
    <div className="flex flex-row space-x-4 items-center">
    <div className="flex p-1 md:p-1.5 m-0 rounded-full h-max w-max bg-primary-500">
      <span className="icon-[entypo--info] h-3 w-3  md:h-4 md:w-4 text-whites-500"></span>
    </div>

    <Typography className="font-[Inter-Medium] text-sm sm:text-base text-whites-40">
      {data?.type === "season"
        ? data?.film?.yearOfProduction
        : data?.yearOfProduction}
    </Typography>

    </div>
   

    <div className="flex text-[#F8FAEC] text-[20px] text-center select-none relative font-[Inter-SemiBold] gap-3">
    {data?.type !== "series" && (
      <Stack direction="row" className="gap-2 !uppercase">
        {data?.access?.toLowerCase()?.includes("free") ? (
          <Typography className="font-[Inter-Medium] text-sm md:text-sm text-whites-40">
            Free
          </Typography>
        ) : (
          <Stack
            direction="row"
            className="gap-2 flex flex-row items-center"
          >
            {/* <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span> */}
            <Typography className="font-[Inter-Medium] text-sm md:text-sm text-whites-40">
              Rent
            </Typography>
          </Stack>
        )}
      </Stack>
    )}
  </div>
  </div>
  )
}
        
        </>
    
    </MovieContainer>
  );
}

export default MovieCard4

const MovieContainer = styled(Box)`
  &&.pixelated > img {
    image-rendering: pixelated !important;
  }
`;
