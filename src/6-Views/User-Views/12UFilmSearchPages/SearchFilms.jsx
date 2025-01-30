import { Stack } from '@mui/material';
import React, { useCallback } from 'react'
import styled from 'styled-components';
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import SearchComponent from './SearchComponent';
import Footer from '../../../2-Components/Footer/Footer';
import { useGetAllFilms } from '../../../5-Store/TanstackStore/services/queries';

const SearchFilms = () => {
   //get all films

    const [allMovies, setMovies] = React.useState([]);
  
    
    const [allFilteredMovies, setAllFilteredMovies] = React.useState([]);
  
    const [query, setQuery] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);
  
    
    let getallfilms = useGetAllFilms();
  
    React.useEffect(() => {
   
      setLoading(true);
      if (getallfilms?.data?.films) {
       
        // get all movies
        let queryMovies = getallfilms?.data?.films.filter((data) => {
          if (data?.visibility === "published"){
            if(data?.type === "movie" || data?.type?.includes("film")){
              return data
            }
          }
          });
        setMovies(() => queryMovies);
  
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, [getallfilms?.data?.films]);
  
    //DebouncedSearch
    const debouncedSearch = useCallback(
      debounce((searchQuery)=> {
        if(searchQuery.trim() === ""){
         
          setAllFilteredMovies(allMovies);
        }else {
          const lowerCaseQuery = searchQuery.toLowerCase();
          
          const filteredMovies = allMovies.filter((data) => {
            return data.title.toLowerCase().includes(lowerCaseQuery);
          });
        
          setAllFilteredMovies(filteredMovies);
        }
      }, 500),
      [allMovies]
    )
  
    React.useEffect(() => {
      debouncedSearch(query);
    }, [query, debouncedSearch]);
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
    <WebNavigation isLoggedIn={true} />
    <Stack className="flex-col w-full h-full space-y-0">
      <div className="px-4 pt-28 md:px-16 md:pt-36">
        <SearchComponent type={"films"} films={allFilteredMovies} query={query} setQuery={setQuery} loading={loading} error={error} errorMessage={errorMessage} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} setItemsPerPage={setItemsPerPage} />
      </div>
    </Stack>
    <Footer />
  </Container>
  )
}

export default SearchFilms

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