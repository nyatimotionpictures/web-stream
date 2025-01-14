import React from "react";
import FilmJSON from "../../1-Assets/data/film_metadata.json";
import MovieCard from "../Cards/MovieCard";
//import { Stack } from '@chakra-ui/react';
import styled from "styled-components";
import { Stack } from "@mui/material";
import { useGetSimilarFilms } from "../../5-Store/TanstackStore/services/queries";
import MovieCard4 from "../Cards/MovieCard4";

const MoreLikeTab = ({ filmdata, allSeasonData }) => {
  const [allMovies, setAllMovies] = React.useState([]);
  const [queriedSeasons, setQueriedSeasons] = React.useState([]);
  let getSimilarFilmsQuery = filmdata?.type?.includes("series") ||
  filmdata?.type?.includes("film") ? useGetSimilarFilms(filmdata?.id) : null;

  // console.log("getSimilarFilmsQuery", getSimilarFilmsQuery)
  React.useEffect(() => {
    if (getSimilarFilmsQuery?.data?.films?.length > 0) {
      setAllMovies(() => getSimilarFilmsQuery?.data?.films);
    } else {
      setAllMovies(() => []);
    }
  }, [getSimilarFilmsQuery?.data]);

  // React.useEffect(() => {
  //     setAllMovies(() => FilmJSON);
  // }, []);

  React.useEffect(() => {
    if (filmdata?.type?.includes("series") ||
    filmdata?.type?.includes("film") ) {
      setQueriedSeasons(() => []);
    } else {
      let season = allSeasonData?.filter((data) => {
        if (data?.id === filmdata?.id) {
          return null
        } else {
          return {
            ...data,
            type: "season",
          }
        }
      });
      setQueriedSeasons(() => season);
    }
  }, [allSeasonData, filmdata]);

  console.log(allSeasonData);
  return (
    <Container>
      {filmdata?.type?.includes("series") ||
      filmdata?.type?.includes("film") ? (
        <Stack className="flex flex-row flex-wrap items-center justify-center gap-[40px] w-full">
          {allMovies.length === 0 ? (
            <div className=" h-full  flex items-center min-h-[20vh] justify-center text-center text-whites-40 text-lg font-[Inter-Regular] w-full">
              No similar films found
            </div>
          ) : (
            <>
              {allMovies.map((data, index) => {
                return (
                  <MovieCard key={index} data={data} stylecard={"w-300px"} />
                );
              })}
            </>
          )}
        </Stack>
      ) : (
        <Stack className="flex flex-row flex-wrap items-center justify-center gap-[40px] w-full">
          {queriedSeasons.length === 0 ? (
            <div className=" h-full  flex items-center min-h-[20vh] justify-center text-center text-whites-40 text-lg font-[Inter-Regular] w-full">
              No similar films found
            </div>
          ) : (
            <>
              {queriedSeasons.map((data, index) => {
                return (
                  <MovieCard4 key={index} data={data} stylecard={"w-300px"} />
                );
              })}
            </>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default MoreLikeTab;
const Container = styled(Stack)``;
