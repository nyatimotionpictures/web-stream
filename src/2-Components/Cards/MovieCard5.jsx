import React from "react";
import noImage from "../../1-Assets/no-image.svg";
import styled from "styled-components";
import { Typography, Stack } from "@mui/material";

import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";

const MovieCard5 = ({ data, stylecard }) => {
  const [isImgBroken, setIsImgBroken] = React.useState(false);
  const [playActions, setPlayActions] = React.useState(false);
  const [posterlink, setPosterLink] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  console.log(data);

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
    window.innerWidth > 960 && setPlayActions(true);
  };

  const onMouseLeave = () => {
    window.innerWidth > 960 && setPlayActions(false);
  };

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
  //randomize data
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

  // console.log(data);
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
          ? navigate(`/segments/${data?.id}/${data?.filmId}`)
          : null
      }
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={
        "min-h-[250px] h-max w-[194px] sm:w-[292px] md:min-h-[510px] md:w-[300px] flex flex-col items-start gap-3 pixelated div-border select-none overflow-hidden "
      }
    >
      <div className="bg-secondary-200 h-[252px] sm:h-[389px] w-full p-0 m-0 overflow-hidden rounded-tl-lg rounded-tr-lg">
        <img
          onError={handleImgError}
          // src={posterlink}
          src={isImgBroken ? noImage : posterlink.url}
          alt={""}
          className="object-cover sm:object-cover object-top size-fit h-full  w-full"
        />
      </div>

      <Stack className="flex flex-row p-0 m-0 items-center justify-center gap-2 lg:pt-3">
        {data?.type !== "series" && (
          <Stack direction="row" className="gap-2">
            {data?.access?.toLowerCase()?.includes("free") ? (
              <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40">
                Free to watch
              </Typography>
            ) : (
              <Stack direction="row" className="gap-2">
                <span className="icon-[solar--bag-heart-outline] h-6 w-6 text-primary-500"></span>
                <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40">
                  Rent to watch
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <div className="min-h-[75px] w-[100%] flex flex-row justify-between items-center gap-4 relative pb-0"></div>
    </MovieContainer>
  );
};

export default MovieCard5;

const MovieContainer = styled.div`
  &&.pixelated > img {
    image-rendering: auto !important;
  }
`;
