import { Stack, Typography } from "@mui/material";
import React from "react";

import styled from "styled-components";
import Button from "../../../2-Components/Buttons/Button";
import { useNavigate } from "react-router-dom";
import heroImg from "../../../1-Assets/Hero.png"

const UserHero = ({ filmData }) => {
  const [backDropUrl, setBackDropUrl] = React.useState(null);
  const [backdropData, setBackdropData] = React.useState([]);
  let navigate = useNavigate();


    React.useEffect(() => {
       
        let backdropArray = []; 
         filmData?.posters?.filter((data, index) => {
            if (data.isCover !== true) {
              backdropArray.push(data);
            }
                return ;
            
        })
        setBackdropData(backdropArray);
    }, [filmData?.posters]);


//console.log("backdropData", filmData)
  return (
    <div
      className={`flex flex-col  !h-screen w-screen bg-cover bg-no-repeat bg-fixed relative`}
    >
      <img
        src={backdropData[0]?.url ? backdropData[0]?.url : ""}
        //src={heroImg}
        alt=""
        className="flex absolute top-0 object-cover h-full w-full select-none bg-gradient-to-b from-transparent to-secondary-700"
        style={{
          filter: "brightness(24%)", // Adjust brightness if needed
        }}
      />

      <div className="flex absolute top-0 object-cover h-full w-full select-none  bg-gradient-to-b from-transparent to-secondary-800" />

      <div className="mx-auto h-screen px-5 md:px-16 py-32 flex items-center">
        <div className="flex flex-col relative  h-screen w-screen ">
          <div className="w-max absolute left-0 bottom-20">
            <Stack
              spacing={"24px"}
              className="flex flex-col  mx-auto max-w-[300px]  lg:max-w-3xl text-left md:max-w-[500px]  lg:w-[500px] overflow-hidden"
            >
              <Typography className="font-[Inter-Bold] line-clamp-1 md:line-clamp-0 text-2xl md:text-5xl text-whites-40 select-none">
                {filmData?.title}
              </Typography>
              <Typography className=" line-clamp-5 lg:line-clamp-0 font-[Inter-Regular] text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                {filmData?.plotSummary}
              </Typography>

              {filmData?.type?.toLowerCase().includes("series") ||
              filmData?.type?.toLowerCase().includes("segment") ? (
                <div className="hidden">
                  {filmData?.season?.length > 0 && (
                    <Typography className="font-[Inter-Regular] text-[#EEF1F4] text-sm md:text-base text-ellipsis select-none">
                      {filmData?.season[0]?.title}
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
                <ul className="line-clamp-1 font-[Inter-Regular] text-[#FFFAF6] flex list-disc w-full space-x-8 text-xs sm:text-sm md:text-base md:flex-wrap gap-y-3 items-start justify-start">
                  <li className="w-max">
                    {filmData?.type === "series"
                      ? "series"
                      : filmData?.type === "movie"
                      ? "film"
                      : null}{" "}
                  </li>

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
                {filmData?.type !== "series" && (
                    <>
                <Stack direction="row" className="gap-2">
                  <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span>
                  
                      {filmData?.access?.toLowerCase()?.includes("free") ? (
                        <Typography className="font-[Inter-Medium] text-base text-whites-40">
                          Free to watch
                        </Typography>
                      ) : (
                        <Typography className="font-[Inter-Medium] text-base text-whites-40">
                          Rent to watch
                        </Typography>
                      )}
                  
                </Stack>
                  </>
                )}

                <Button
                  onClick={() =>
                    filmData?.type === "movie"
                      ? navigate(`/film/${filmData?.id}`)
                      : filmData?.type === "series"
                      ? navigate(`/series/${filmData?.id}`)
                      : null
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHero;
