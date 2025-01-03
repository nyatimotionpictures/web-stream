import { Box, Stack, Typography } from '@mui/material';
import React from 'react'
import styled from 'styled-components';
// import MovieCard2 from '../../../2-Components/Cards/MovieCard2';

import MovieCard4 from '../../../2-Components/Cards/MovieCard4';
import FilmJson from "../../../1-Assets/data/film_metadata.json"

const BrowseTabShows = ({allFilteredTvShows}) => {
//   const [moviedata, setMovieData] = React.useState([{
//     title: '1'
// }]);

let moviedata = FilmJson
  return (
    <Container className=" h-full relative">
    {allFilteredTvShows?.length > 0 ? (
           <Stack className="flex flex-row flex-wrap gap-5 items-center justify-center mb-10">
           {
               allFilteredTvShows?.map((data, index)=>{
                 return  <MovieCard4 key={index} data={data} />
               })
             }
           
           </Stack>
    ) : (
      <Box className="h-[100%]">
        <Stack className="flex flex-col h-full w-full min-h-[45vh] items-center justify-center my-auto">
          <Typography className="text-whites-40 font-[Inter-Medium] text-lg">
            Search list is currently empty
          </Typography>
          
        </Stack>
      </Box>
    )}
  </Container>
  )
}

export default BrowseTabShows

const Container = styled.div``;