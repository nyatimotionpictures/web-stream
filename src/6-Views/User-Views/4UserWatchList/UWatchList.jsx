
import React, { useContext } from "react";
import styled from "styled-components";

import UWatchTabs from "./UWatchTabs";
import { Stack } from "@mui/material";
import WebNavigation from "../../../2-Components/Navigation/WebNavigation";
import Footer from "../../../2-Components/Footer/Footer";
import { useGetWatchList } from "../../../5-Store/TanstackStore/services/queries";
import { AuthContext } from "../../../5-Store/AuthContext";

const UWatchList = () => {
   const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const userData = useContext(AuthContext);
  const watchedQuery = useGetWatchList(userData?.currentUser?.user?.id);

  // console.log("watchedQuery", watchedQuery?.data);

  // console.log(watchedQuery?.data?.watched);
  let allWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
      return film
    })
  },[watchedQuery?.data])

  let filmsWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
     if (film.type?.includes("film") || film.type === "movie" ) {
      return film
     }
    })
  },[watchedQuery?.data])

  let showsWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
      if (film?.type === "episode" || film?.type === "series" || !film?.type?.includes("film") ) {
        console.log("film", film)
       return film
      }
     })
  },[watchedQuery?.data?.watchlist?.SAVED])

  console.log("showsWatched", showsWatched)



  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
      <WebNavigation isLoggedIn={true} />
      <Stack className="flex-col w-full h-full space-y-0 max-w-screen-2xl m-auto">
        <div className="px-4 pt-28 md:px-16 md:pt-36">
          <UWatchTabs allWatched={allWatched} filmsWatched={filmsWatched} showsWatched={showsWatched} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}  />
        </div>
      </Stack>
      <Footer />
    </Container>
  );
};

export default UWatchList;

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;