import { Stack } from '@mui/material';
import React, { useCallback } from 'react'
import styled from 'styled-components';
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import SearchComponent from './SearchComponent';
import Footer from '../../../2-Components/Footer/Footer';
import { useGetAllFilms, useGetAllSeasons } from '../../../5-Store/TanstackStore/services/queries';



const SearchAll = () => {
   const [allFilms, setAllFilms] = React.useState([]);
   
   const [allFilteredFilms, setAllFilteredFilms] = React.useState([]);

    const [query, setQuery] = React.useState('');
     const [loading, setLoading] = React.useState(false);
     const [currentPage, setCurrentPage] = React.useState(1);
     const [itemsPerPage, setItemsPerPage] = React.useState(10);
   
     const [error, setError] = React.useState(false);
     const [errorMessage, setErrorMessage] = React.useState(null);

      let getallfilms = useGetAllFilms();
      let getallseasons = useGetAllSeasons();

      console.log("getallseasons", getallseasons?.data?.seasons)

        React.useEffect(() => {
       
          setLoading(true);
          if (getallfilms?.data?.films) {
           
            // get all movies
            let queryMovies = getallfilms?.data?.films.filter((data) => {
              if (data?.visibility === "published") {
                if (data?.type === "movie" || data?.type?.includes("film")) {
                  return data
                }
              }
              

            });
            
      
            // get all shows
            let queryShows = getallfilms?.data?.films.filter((data) => {
              if(data?.visibility === "published"){
                if (data?.type === "series"){
                  return data
                }
              }
              });
      
            //query episodes
            console.log(queryShows)
            let querySeasons = getallseasons?.data?.seasons.map((data) => {
              
                return {
                  ...data,
                  type: "season",
                }
            
            }).flat();
      
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
      
            console.log(querySeasons)
            setAllFilms(() => [...queryMovies, ...querySeasons, ...queryShows]);
           
      
            // console.log(queryEpisodes);
      
            // console.log(querySeasons);
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
              
            }else {
              const lowerCaseQuery = searchQuery.toLowerCase();
              const filteredFilms = allFilms.filter((data) => {
                return data.title.toLowerCase().includes(lowerCaseQuery);
              });
             
              setAllFilteredFilms(filteredFilms);
              
            }
          }, 500),
          [allFilms]
        )
      
        React.useEffect(() => {
          debouncedSearch(query);
        }, [query, debouncedSearch]);
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
    <WebNavigation isLoggedIn={true} />
    <Stack className="flex-col w-full h-full space-y-0">
      <div className="px-4 pt-28 md:px-16 md:pt-36">
        <SearchComponent type={"all"} films={allFilteredFilms} query={query} setQuery={setQuery} loading={loading} error={error} errorMessage={errorMessage} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} setItemsPerPage={setItemsPerPage} />
      </div>
    </Stack>
    <Footer />
  </Container>
  )
}

export default SearchAll

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;