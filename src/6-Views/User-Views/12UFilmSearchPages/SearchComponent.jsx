import React from "react";
import { Box, Pagination, Stack, Typography } from "@mui/material";
import {
  FormContainer,
  SingleWrapper,
} from "../../../2-Components/Stacks/InputFormStack";
import styled from "styled-components";
import FilmJson from "../../../1-Assets/data/film_metadata.json";
import MovieCard4 from "../../../2-Components/Cards/MovieCard4";

const SearchComponent = ({
  type,
  films,
  query,
  setQuery,
  loading,
  error,
  errorMessage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  //pagination
  const [currentPage, setCurrentPage] = React.useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = films?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-[54vh] h-full  bg-secondary-800">
      <Stack className="flex flex-col gap-8">
        <SingleWrapper>
          <FormContainer>
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
{/* 
        <div className="flex flex-row flex-wrap gap-3 items-center justify-center mb-10">
              {currentItems?.map((data, index) => {
                return <MovieCard4 key={index} data={data} />;
              })}
            </div> */}

        <Container className=" h-full relative">
          {currentItems?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6  gap-3 lg:gap-5 items-center justify-center mb-10">
              {currentItems?.map((data, index) => {
                return <MovieCard4 key={index} data={data} />;
              })}
            </div>
          ) : (
            <Box className="h-[100%]">
              <Stack className="flex flex-col h-full w-full min-h-[45vh] items-center justify-center my-auto">
                <Typography className="text-whites-40 font-[Inter-Medium] text-lg">
                  Search list is currently empty
                </Typography>
              </Stack>
            </Box>
          )}

          {/** pagination */}
         
         {
           films?.length > itemsPerPage && (
            <div className="flex flex-row justify-center items-center gap-2 mt-10 mb-10 text-whites-40 ">
            <Pagination
              count={Math.ceil(films?.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
             
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "white !important", // Change text color to white
                  borderColor: "white !important", // Change border color to white for outlined variant
                },
                "& .Mui-selected": {
                  backgroundColor: "white !important", // Change selected background color to white
                  color: "black !important", // Change selected text color to black for contrast
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1) !important", // Slight white hover effect
                  color: "white !important", // Change hover text color to white
                },
              }}
            />
          </div>
           )
         }
       
        </Container>
      </Stack>
    </div>
  );
};

export default SearchComponent;

const Container = styled.div``;
