import { Stack } from '@mui/material';
import React, { useCallback } from 'react'
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import BrowseTabs from './BrowseTabs';
import styled from 'styled-components';

import { useGetAllFilms, useGetAllSeasons } from '../../../5-Store/TanstackStore/services/queries';


const BrowsePage = () => {
  //get all films
  const [allFilms, setAllFilms] = React.useState([]);
  const [allTvShows, setTvShows] = React.useState([]);
  const [allMovies, setMovies] = React.useState([]);

  const [allFilteredFilms, setAllFilteredFilms] = React.useState([]);
  const [allFilteredTvShows, setAllFilteredTvShows] = React.useState([]);
  const [allFilteredMovies, setAllFilteredMovies] = React.useState([]);

  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);

  
  let getallfilms = useGetAllFilms();
  let getallseasons = useGetAllSeasons();

  // console.log(getallfilms?.data?.films)
  React.useEffect(() => {
 
    setLoading(true);
    if (getallfilms?.data?.films) {
     
      // get all movies
      let queryMovies = getallfilms?.data?.films.filter((data) => {
        if(data?.visibility === "published"){
            if ( data?.type === "movie" || data?.type?.includes("film")) {
              return data
            }
        }
       
      } );
      setMovies(() => queryMovies);

      // get all shows
      let queryShows = getallfilms?.data?.films.filter((data) => {
        if (data?.visibility === "published") {
          if(data?.type === "series") {
            return data
          }
        }
        }); 

      //query episodes
      let querySeasons = getallseasons?.data?.seasons?.map((season) => {
        return {
          ...season,
          type: "season",
        }
      }).flat() ?? [];

      // let queryEpisodes = querySeasons.map((data) => {
      //   return data?.episodes?.map((episode)=> {
      //     return {
      //       ...episode,
      //       type: "episode",
      //       seasonData: {
      //         seasonId: data?.id,
      //         season: data?.season,
      //         title: data?.title,
      //         filmId: data?.id,
      //       }
      //     }
      //   }); 
      // }).flat();

      setAllFilms(() => [...queryMovies, ...querySeasons, ...queryShows]);
      setTvShows(() => [...queryShows, ...querySeasons]);

     
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [getallfilms?.data?.films, getallseasons?.data?.seasons]);

  //DebouncedSearch
  const debouncedSearch = useCallback(
    debounce((searchQuery)=> {
      if(searchQuery.trim() === ""){
        setAllFilteredFilms(allFilms);
        setAllFilteredTvShows(allTvShows);
        setAllFilteredMovies(allMovies);
      }else {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filteredFilms = allFilms.filter((data) => {
          return data.title.toLowerCase().includes(lowerCaseQuery);
        });
        const filteredTvShows = allTvShows.filter((data) => {
          return data.title.toLowerCase().includes(lowerCaseQuery);
        });
        const filteredMovies = allMovies.filter((data) => {
          return data.title.toLowerCase().includes(lowerCaseQuery);
        });
        setAllFilteredFilms(filteredFilms);
        setAllFilteredTvShows(filteredTvShows);
        setAllFilteredMovies(filteredMovies);
      }
    }, 500),
    [allFilms, allTvShows, allMovies]
  )

  React.useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <Container className="w-full min-h-screen h-full relative flex-col space-y-0 bg-secondary-800">
    <WebNavigation isLoggedIn={true} />
    <Stack className="flex-col w-full h-full space-y-0  m-auto">
      <div className="px-4 pt-28 md:px-16 md:pt-36">
      <BrowseTabs query={query} setQuery={setQuery} allFilteredFilms={allFilteredFilms} allFilteredTvShows={allFilteredTvShows} allFilteredMovies={allFilteredMovies} loading={loading} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
      </div>
    </Stack>
   
   
  </Container>
  )
}

export default BrowsePage

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}


const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;