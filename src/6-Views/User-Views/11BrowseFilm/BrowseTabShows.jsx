import { Box, Pagination, Stack, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
// import MovieCard2 from '../../../2-Components/Cards/MovieCard2';

import MovieCard4 from "../../../2-Components/Cards/MovieCard4";
import FilmJson from "../../../1-Assets/data/film_metadata.json";

const BrowseTabShows = ({
  allFilteredTvShows,
  loading,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allFilteredTvShows?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
  return (
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

      {allFilteredTvShows?.length > itemsPerPage && (
        <div className="flex flex-row justify-center items-center gap-2 mt-0 text-whites-40 ">
          <Pagination
            count={Math.ceil(allFilteredTvShows?.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "white", // Change text color to white
                borderColor: "white", // Change border color to white for outlined variant
              },
              "& .Mui-selected": {
                backgroundColor: "white", // Change selected background color to white
                color: "black", // Change selected text color to black for contrast
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight white hover effect
                color: "white", // Change hover text color to white
              },
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default BrowseTabShows;

const Container = styled.div``;
