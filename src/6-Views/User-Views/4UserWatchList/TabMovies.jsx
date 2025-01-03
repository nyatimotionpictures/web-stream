
import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
import MovieCard3 from "../../../2-Components/Cards/MovieCard3";
import MovieCard4 from "../../../2-Components/Cards/MovieCard4";
import FilmJson from "../../../1-Assets/data/film_metadata.json"

const TabMovies = ({filmsWatched}) => {
    // const [moviedata, setMovieData] = React.useState([
    //   {
    //     title: "1",
    //   },
    // ]);

    let moviedata = FilmJson
  return (
    <Container className="w-full h-full relative">
      {filmsWatched?.length > 0 ? (
        <>
        <Stack className="hidden md:flex flex-row flex-wrap gap-5 items-center justify-center mb-10 ">
         {filmsWatched?.map((data, index) => {
           return <MovieCard3 key={index} data={data} />;
         })}
       </Stack>

       <Stack className="flex md:hidden flex-row flex-wrap gap-5 items-center justify-center mb-10">
         {filmsWatched?.map((data, index) => {
           return <MovieCard4 key={index} data={data} />;
         })}
       </Stack>
       </>
      ) : (
        <Box className="h-[100%]">
          <Stack className="flex flex-col h-full w-full min-h-[45vh] items-center justify-center my-auto">
            <Typography className="text-whites-40 font-[Inter-Medium] text-lg">
              Your Watchlist is currently empty
            </Typography>
            <Typography className="text-whites-40 font-[Inter-Medium] text-lg max-w-[480px] text-center">
              Add <span className="underline">TV shows</span> and{" "}
              <span className="underline">Movies</span> that you want to watch
              later by clicking Add to{" "}
              <span className="underline">Watchlist</span>.
            </Typography>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default TabMovies;

const Container = styled.div``;