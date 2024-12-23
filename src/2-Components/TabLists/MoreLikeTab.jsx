import React from 'react'
import FilmJSON from '../../1-Assets/data/film_metadata.json'
import MovieCard from '../Cards/MovieCard';
//import { Stack } from '@chakra-ui/react';
import styled from 'styled-components';
import { Stack } from '@mui/material';

const MoreLikeTab = () => {
    const [allMovies, setAllMovies] = React.useState([]);

    React.useEffect(() => {
        setAllMovies(() => FilmJSON);
    }, []);
  return (
      <Container>

          <Stack  className="flex flex-row flex-wrap items-center justify-center gap-[40px] w-full">
              {
                  allMovies.map((data, index) => {
                      return <MovieCard key={index} data={data} stylecard={"w-300px"} />;
                  })
              }

          </Stack>

      </Container>
  )
}

export default MoreLikeTab
const Container = styled(Stack)``