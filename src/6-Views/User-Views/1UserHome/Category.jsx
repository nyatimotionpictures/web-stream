import { Stack, Typography } from "@mui/material";
import React from "react";
import MovieCarousel from "../../../2-Components/Carousels/MovieCarousel";

const Category = ({ categoryInfo }) => {
  const [films, setFilms] = React.useState([]);

  React.useEffect(() => {
    if (categoryInfo?.type === "series") {
      //get all films from season and combine them
      console.log(categoryInfo);
      let filmData = categoryInfo?.seasons
        .filter((season) => {
          if (season.visibility === "published") {
            return season
          }
        })
        .flat();

      setFilms(() => filmData);
    } else {
      setFilms(() => categoryInfo?.films);
    }
  }, [categoryInfo]);
  return (
    <div className="w-full mx-auto flex  md:gap-10 lg:gap-16  xl:gap-24 items-start">
      <Stack spacing={"20px"} className="pl-2 lg:pl-16 flex-col w-screen">
        <Typography className="text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[22px] text-left">
          {categoryInfo?.name}
        </Typography>

        <Stack className="flex w-full  gap-0 items-center justify-center mx-auto !overflow-hidden">
          {films.length > 0 && (
            <MovieCarousel displayData={films} cardtype="genre" />
          )}
        </Stack>
      </Stack>
    </div>
  );
};

export default Category;
