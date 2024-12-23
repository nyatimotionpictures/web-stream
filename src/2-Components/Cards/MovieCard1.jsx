import React from "react";
//import posterImage from "../../1-Assets/images/Movie poster/Movie poster.svg";
import posterImage from "../../1-Assets/Posterimage.png";
import styled from "styled-components";
import { Typography, Stack } from "@mui/material";

import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";

const MovieCard1 = ({ data, stylecard }) => {
  const [playActions, setPlayActions] = React.useState(false);
  const [posterlink, setPosterLink] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  let ref = React.useRef();
  let navigate = useNavigate();



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
    setOpenModal(true);
    window.innerWidth > 960 && setPlayActions(true);
  };

  const onMouseLeave = () => {
    setOpenModal(false);
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

      <div className="min-h-[75px] w-[100%] flex flex-row justify-between items-center gap-4 relative pb-0">
        {
            openModal && (
                <div className="h-max w-[100%] flex flex-row justify-between items-center gap-4 relative pb-0">
                <div className="flex flex-col gap-2">
                  <Typography className="line-clamp-1 font-semibold font-[Inter-SemiBold] text-base md:text-[22.22px] text-whites-40">
                    {data.title}
                  </Typography>
      
                  <div className="flex flex-row gap-2 line-clamp-1 font-light font-[Inter-Regular] text-xs md:text-base text-whites-40">
                    <p>2006</p>
                    <p>01h 90m</p>
                  </div>
                </div>
      
                {/** duration */}
                <Button className="flex py-2 px-2 rounded-full h-max w-max">
                  <span className="icon-[solar--info-circle-outline] h-6 w-6 text-whites-500"></span>
                </Button>
              </div>
            )
        }
    
      </div>

      {/* <div className="h-max w-[100%]  relative pb-0">
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
    </div> */}
    </MovieContainer>
  );
};

export default MovieCard1;

const MovieContainer = styled.div`
  &&.pixelated > img {
    image-rendering: auto !important;
  }
`;
