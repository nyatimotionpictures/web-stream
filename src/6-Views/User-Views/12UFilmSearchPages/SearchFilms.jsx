import { Stack } from '@mui/material';
import React from 'react'
import styled from 'styled-components';
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import SearchComponent from './SearchComponent';
import Footer from '../../../2-Components/Footer/Footer';

const SearchFilms = () => {
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
    <WebNavigation isLoggedIn={true} />
    <Stack className="flex-col w-full h-full space-y-0">
      <div className="px-4 pt-28 md:px-16 md:pt-36">
        <SearchComponent type={"films"} />
      </div>
    </Stack>
    <Footer />
  </Container>
  )
}

export default SearchFilms

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;