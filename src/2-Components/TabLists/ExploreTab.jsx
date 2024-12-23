import React from 'react'
import FilmJSON from '../../1-Assets/data/film_metadata.json'
import MovieCard from '../Cards/MovieCard';
//import { Stack } from '@chakra-ui/react';
import styled from 'styled-components';
import { Stack } from '@mui/material';
const ExploreTab = () => {
    const [allMovies, setAllMovies] = React.useState([]);

    React.useEffect(() => {
        setAllMovies(() => FilmJSON);
    }, []);
  return (
      <Container>

          <Stack spacing={'20px'} className="flex-row flex-wrap w-full">
              {
                  allMovies.map((data, index) => {
                      return <MovieCard key={index} data={data} stylecard={"w-300px"} />;
                  })
              }

          </Stack>

      </Container>
  )
}

export default ExploreTab

const Container = styled(Stack)``