
import React, { useContext } from "react";
import styled from "styled-components";

import UWatchTabs from "./UWatchTabs";
import { Stack } from "@mui/material";
import WebNavigation from "../../../2-Components/Navigation/WebNavigation";
import Footer from "../../../2-Components/Footer/Footer";
import { useGetWatchList } from "../../../5-Store/TanstackStore/services/queries";
import { AuthContext } from "../../../5-Store/AuthContext";

const UWatchList = () => {
  // const [allWatched, setAllWatched] = React.useState([]);
  // const [filmsWatched, setFilmsWatched] = React.useState([]);
  // const [showsWatched, setShowsWatched] = React.useState([]);
  const userData = useContext(AuthContext);


  const watchedQuery = useGetWatchList(userData?.currentUser?.user?.id);

  console.log("watchedQuery", watchedQuery?.data);

  console.log(watchedQuery?.data?.watched);
  let allWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
      return film
    })
  },[watchedQuery?.data])

  let filmsWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
     if (film.type === "film" || film.type === "movie" ) {
      return film
     }
    })
  },[watchedQuery?.data])

  let showsWatched =  React.useMemo(()=>{
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film)=> {
      if (film?.type === "episode" || film?.type === "series" || film?.type !== "movie" ) {
       return film
      }
     })
  },[watchedQuery?.data])



  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
      <WebNavigation isLoggedIn={true} />
      <Stack className="flex-col w-full h-full space-y-0">
        <div className="px-4 pt-28 md:px-16 md:pt-36">
          <UWatchTabs allWatched={allWatched} filmsWatched={filmsWatched} showsWatched={showsWatched}   />
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