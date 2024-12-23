import React from "react";
import styled from "styled-components";
import { Box, Stack, Typography } from "@mui/material";
import Button from "../../../2-Components/Buttons/Button";
import heroImg from "../../../1-Assets/Hero.png"


const UDetailHero = ({ filmData, handlePaymentModel }) => {
  const [backDropUrl, setBackdropUrl] = React.useState(null);

  React.useEffect(() => {
    if (
      filmData?.type?.toLowerCase()?.includes("series") ||
      (filmData?.type?.toLowerCase()?.includes("segment") &&
        filmData?.seasons?.length > 0)
    ) {
      if (
        filmData?.seasons[0]?.episodes?.length > 0 &&
        filmData?.seasons[0]?.episodes[0]?.Backdrops?.length > 0
      ) {
        let bklink = filmData?.seasons[0]?.episodes[0]?.backdrops[0];

        setBackdropUrl(() => bklink);
      }
    } else {
      if (
        filmData?.type?.toLowerCase()?.includes("film") ||
        (filmData?.type?.toLowerCase()?.includes("movie") &&
          filmData?.backdrops?.length > 0)
      ) {
        setBackdropUrl(() => filmData?.backdrops[0]);
      }
    }
  }, [filmData]);
  return (
    <HeroContent
      className={`flex flex-col h-screen w-screen bg-cover bg-no-repeat bg-fixed relative`}
    >
      <img
       // src={backDropUrl ? backDropUrl : ""}
       src={heroImg}
        alt=""
        className="flex absolute top-0 object-cover h-full w-full slect-none bg-gradient-to-b from-transparent to-secondary-700"
        style={{
          filter: "brightness(20%)", // Adjust brightness if needed
        }}
      />
      <div className="flex absolute top-0 object-cover h-full w-full slect-none  bg-gradient-to-b from-transparent to-secondary-800" />
      <Box className="mx-auto h-screen px-5  md:px-16 py-32 flex items-center">
        <Box className="flex flex-col relative  h-screen w-screen ">
          <Box className="w-max absolute left-0 bottom-20">
            <Stack
              spacing={"24px"}
              className="flex flex-col  mx-auto max-w-[300px] lg:max-w-3xl text-left md:max-w-[500px]  lg:w-[500px] overflow-hidden"
            >
              <Typography className="font-[Inter-Bold] line-clamp-1 md:line-clamp-0 text-2xl md:text-5xl text-whites-40 select-none">
                {filmData?.title}
              </Typography>
              <Typography className="line-clamp-3 md:line-clamp-0 font-[Inter-Regular]  text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                {filmData?.plotSummary}
              </Typography>

              {filmData?.type?.toLowerCase()?.includes("series") ||
              filmData?.type?.toLowerCase()?.includes("segment") ? (
                <div>
                  {filmData?.seasons?.length > 0 && (
                    <Typography className="font-[Inter-Regular] text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                      {filmData?.seasons[0]?.title}
                    </Typography>
                  )}
                </div>
              ) : null}

              <Stack
                direction="row"
                className="flex flex-row items-start space-x-8 select-none"
              >
                <Typography className="font-[Inter-Regular] text-[#FFFAF6] text-sm md:text-base">
                  {filmData?.yearOfProduction}
                </Typography>
                <ul className="font-[Inter-Regular] text-[#FFFAF6] flex list-disc w-full space-x-8 text-xs sm:text-sm md:text-base md:flex-wrap gap-y-3 items-start justify-start">
                  <li className="w-max">{filmData?.type} </li>

                  {filmData?.genre?.length > 0 && (
                    <>
                      {filmData?.genre?.map((data, index) => (
                        <li key={index} className="w-max">
                          {data}
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </Stack>

              {/** watch button */}
              <Stack
                direction={"column"}
                spacing={"20px"}
                className="select-none"
              >
                <Stack direction="row" className="gap-2">
                  <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span>
                  {
                    filmData?.access?.toLowerCase()?.includes('free') ? (
                      <Typography className="font-[Inter-Medium] text-base text-whites-40">
                      Free to watch
                    </Typography>
                    ) : (
                      <Typography className="font-[Inter-Medium] text-base text-whites-40">
                        Rent to watch
                      </Typography>
                    )
                  }
                  
                </Stack>

                <Stack className="flex flex-col-reverse gap-4 md:gap-0 md:flex-row space-x-3">
                  {/** handle payment */}
                  <Button onClick={handlePaymentModel} className="flex w-max px-8 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]">
                    <span className="icon-[solar--play-circle-linear] h-6 w-6 text-whites-40"></span>
                    <Typography className="font-[Roboto-Regular] text-base">
                      Watch
                    </Typography>
                  </Button>

                  {/** like buttons */}
                  <Stack direction="row" className="space-x-2">
                    <Button className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]">
                      <span className="icon-[solar--bookmark-circle-broken] h-6 w-6 text-whites-40"></span>
                    </Button>
                    <Button className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]">
                      <span className="icon-[solar--like-broken] h-6 w-6 text-whites-40"></span>
                    </Button>
                    <Button className="flex w-max px-2 py-2 items-center justify-center space-x-2 rounded-full relative bg-[#706e72]">
                      <span className="icon-[solar--dislike-broken] h-6 w-6 text-whites-40"></span>
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </HeroContent>
  );
};

export default UDetailHero;

const HeroContent = styled.div``;