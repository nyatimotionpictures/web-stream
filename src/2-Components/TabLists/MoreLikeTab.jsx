import React from 'react'
import FilmJSON from '../../1-Assets/data/film_metadata.json'
import MovieCard from '../Cards/MovieCard';
//import { Stack } from '@chakra-ui/react';
import styled from 'styled-components';
import { Stack } from '@mui/material';
import { useGetSimilarFilms } from '../../5-Store/TanstackStore/services/queries';

const MoreLikeTab = ({ filmdata }) => {
    const [allMovies, setAllMovies] = React.useState([]);
    let getSimilarFilmsQuery = useGetSimilarFilms(filmdata?.id);

    // console.log("getSimilarFilmsQuery", getSimilarFilmsQuery)
    React.useEffect(() => {
        if (getSimilarFilmsQuery?.data?.films?.length > 0) {
            setAllMovies(() => getSimilarFilmsQuery?.data?.films);
        } else {
            setAllMovies(() => []);
        }
    },  [getSimilarFilmsQuery?.data]);

    // React.useEffect(() => {
    //     setAllMovies(() => FilmJSON);
    // }, []);
  return (
    <Container>
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
    </Container>
  );
}

export default MoreLikeTab
const Container = styled(Stack)``