import React from 'react'
import { Box, Stack, Typography } from '@mui/material';
import { FormContainer, SingleWrapper } from '../../../2-Components/Stacks/InputFormStack';
import styled from 'styled-components';
import FilmJson from "../../../1-Assets/data/film_metadata.json"
import MovieCard4 from '../../../2-Components/Cards/MovieCard4';

const SearchComponent = ({type, films,query, setQuery, loading, error, errorMessage, currentPage, itemsPerPage, setCurrentPage, setItemsPerPage }) => {
   
    
  let moviedata = FilmJson
    
    
 
  return (
    <div className="min-h-[54vh] h-full  bg-secondary-800">
    <Stack className="flex flex-col gap-8">
      {/* <Typography className="font-[Inter-SemiBold] text-xl text-whites-40">
      Watchlist
    </Typography> */}
      {/* search */}

      <SingleWrapper>
        <FormContainer >
          <div className="flex flex-col gap-2 h-full relative justify-center">
            <div className="w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 left-3  m-auto hover:text-primary-500  z-30">
              <span className="icon-[solar--minimalistic-magnifer-broken] text-whites-100 w-5 h-5"></span>
            </div>

            <input
              type="text"
              placeholder="Search"
              className="pl-10 w-full text-whites-40 rounded-full border ring-2-secondary-100  py-3 px-5 text-base text-white outline-none placeholder:text-whites-40 focus:border-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 "
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

        
        </FormContainer>
      </SingleWrapper>

      <Container className=" h-full relative">
      {films?.length > 0 ? (
              <Stack className="flex flex-row flex-wrap gap-5 items-center justify-center mb-10">
                {
                  films?.map((data, index)=>{
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
    </Stack>
  </div>
  )
}

export default SearchComponent

const Container = styled.div``;