import React from "react";
//import posterImage from "../../1-Assets/images/Movie poster/Movie poster.svg";
import styled from "styled-components";
import { Typography, Stack } from "@mui/material";
import posterImage from "../../1-Assets/Posterimage.png";


import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";

const MovieCard = ({ data, stylecard }) => {
    const [playActions, setPlayActions] = React.useState(false);
    const [posterlink, setPosterLink] = React.useState("");
    let ref = React.useRef();
    let navigate = useNavigate();

    //console.log("data", data)
    React.useEffect(() => {
        const handler = (event) => {
            if (playActions && ref.current && !ref.current.contains(event.target)) {
                setPlayActions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);

        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [playActions]);

    const onMouseEnter = () => {
        window.innerWidth > 960 && setPlayActions(true);
    };

    const onMouseLeave = () => {
        window.innerWidth > 960 && setPlayActions(false);
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
    //randomize data
    React.useEffect(() => {
        if (data?.posters?.length > 0 && data?.posters?.length > 1) {
            const shuffledItems = shuffleArray(data.posters);
            let selectedlink = shuffledItems[0];
            setPosterLink(selectedlink);
        } else if (data?.posters?.length > 0 && data?.posters?.length === 1) {
            let selectedlink = data.posters[0];
            setPosterLink(selectedlink);
        } else {
            setPosterLink(() => "");
        }
    }, [data]);

    const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });

    const formatDuration = (time) => {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60) % 60;
        const hours = Math.floor(time / 3600);

        if (hours === 0) {
            return `${minutes}m ${leadingZeroFormatter.format(seconds)}s`;
        } else {
            return `${hours}h ${leadingZeroFormatter.format(
                minutes
            )}m ${leadingZeroFormatter.format(seconds)}s`;
        }
    };
    return (
        <MovieContainer
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={
                "min-h-[250px] h-max w-[194px] sm:w-[292px] md:min-h-[510px] md:w-[300px] flex flex-col items-start gap-3 pixelated div-border select-none overflow-hidden "
            }
        >
            <div
                onClick={() => navigate(`/film/${data?._id.$oid}`)}
                className="bg-secondary-200 h-[252px] sm:h-[389px] w-full p-0 m-0 overflow-hidden rounded-tl-lg rounded-tr-lg"
            >
                <img
                    src={posterImage}
                    alt={""}
                    className="object-cover sm:object-cover object-top size-fit h-full  w-full"
                />
            </div>

            <Stack className="flex flex-row p-0 m-0 items-center justify-center gap-2 lg:pt-3">
                {/* <Typography className="text-[#EE5170]  text-center select-none relative font-medium text-[14px]  sm:text-xl pl-0">
                    Premiered
                </Typography>
                <Typography className="text-[#F8FAEC]  text-center select-none relative font-medium text-[14px]  sm:text-lg pl-0">
                    {data.released}
                </Typography> */}

<Stack direction="row" className="gap-2">
          {data?.filmModel?.toLowerCase()?.includes("free") ? (
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
            </Stack>

            <ul className="capitalize !font-medium text-[#ffffff] flex sm:list-disc w-full space-x-2 sm:space-x-5 text-[11px] sm:!text-base flex-wrap gap-y-3 items-start justify-start overflow-hidden">
                <li className="w-max">{data?.filmType} </li>

                {data?.genre?.length > 0 && (
                    <>
                        {data?.genre?.map((datag, index) => (
                            <li key={index} className=" w-max">
                                {datag}
                            </li>
                        ))}
                    </>
                )}
            </ul>

            <div className="h-max w-[100%]  relative pb-0">
                <div className="flex absolute top-0 object-cover h-full w-full select-none  bg-gradient-to-b from-transparent to-secondary-800" />
                <Typography className="line-clamp-4 text-[#ffffff] font-sans font-normal text-[11px] sm:text-base">
                    {data.plotSummary}
                </Typography>
                <Button
                    onClick={() => navigate(`/film/${data?._id.$oid}`)}
                    variant="ghost"
                    className="text-primary-500 font-sans text-[13px] sm:text-base rounded h-max w-max flex absolute bottom-0 right-0 px-3 py-2 m-0 hover:bg-whites-900 bg-opacity-14%"
                >
                    Read more
                </Button>
            </div>

            {/**
         * 
         * 
         *  <Stack
        direction="row"
        className={`w-full  justify-between p-2 ${
          playActions ? "flex" : "hidden"
        }`}
      >
        <div>
          <Typography className="font-[Inter-SemiBold] text-base text-whites-40">
            {data?.title}
          </Typography>
          <Stack direction="row">
            <Typography className="font-[Inter-Medium] text-base text-whites-40">
              {data?.YearOfProduction}
            </Typography>
            <Typography className="font-[Inter-Medium] text-base text-whites-40">
              {data?.runtime && formatDuration(data?.runtime)}
            </Typography>
          </Stack>
        </div>
        <div>
          <Buttons
            onClick={() => navigate(`/film/${data?._id.$oid}`)}
            variant={"icon"}
            className="flex rounded-full relative bg-primary-400"
          >
            <span className="icon-[solar--play-circle-linear] h-6 w-6 text-whites-40"></span>
          </Buttons>
        </div>
      </Stack> **/}
        </MovieContainer>
    );
};

export default MovieCard;

const MovieContainer = styled.div`
  &&.pixelated > img {
    image-rendering: auto !important;
  }
`;
