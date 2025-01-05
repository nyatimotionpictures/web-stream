
import { Box, Pagination, Stack, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
import MovieCard3 from "../../../2-Components/Cards/MovieCard3";
import FilmJson from "../../../1-Assets/data/film_metadata.json"
import MovieCard4 from "../../../2-Components/Cards/MovieCard4";


const TabAll = ({allWatched, itemsPerPage, setItemsPerPage}) => {
   const [currentPage, setCurrentPage] = React.useState(1);
  
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allWatched?.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  
    const handlePageChange = (event, page) => {
      setCurrentPage(page);
    };

  return (
    <Container className="w-full h-full relative">
      {currentItems?.length > 0 ? (
        <>
         <Stack className="hidden md:flex flex-row flex-wrap gap-5 items-center justify-center mb-10 ">
          {currentItems?.map((data, index) => {
            return <MovieCard3 key={index} data={data} />;
          })}
        </Stack>

        <Stack className="flex md:hidden flex-row flex-wrap gap-5 items-center justify-center mb-10">
          {currentItems?.map((data, index) => {
            return <MovieCard4 key={index} data={data} />;
          })}
        </Stack>
        </>
       
      ) : (
        <Box className="h-[100%]">
          <Stack className="flex flex-col h-full w-full min-h-[45vh] items-center justify-center my-auto">
            <Typography className="text-whites-40 font-[Inter-Medium] text-base md:text-lg">
              Your Watchlist is currently empty
            </Typography>
            <Typography className="text-whites-40 font-[Inter-Medium] text-base md:text-lg max-w-[480px] text-center">
              Add <span className="underline">TV shows</span> and{" "}
              <span className="underline">Movies</span> that you want to watch
              later by clicking Add to{" "}
              <span className="underline">Watchlist</span>.
            </Typography>
          </Stack>
        </Box>
      )}

        {/** pagination */}    
            {allWatched?.length > itemsPerPage && (
              <div className="flex flex-row justify-center items-center gap-2 mt-0 text-whites-40 ">
              <Pagination
                count={Math.ceil(allWatched?.length / itemsPerPage)}
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
            )
           }
    </Container>
  );
};

export default TabAll;

const Container = styled.div``;