import { Stack } from '@mui/material';
import React from 'react'
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import BrowseTabs from './BrowseTabs';
import styled from 'styled-components';
import Footer from '../../../2-Components/Footer/Footer';

const BrowsePage = () => {
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
    <WebNavigation isLoggedIn={true} />
    <Stack className="flex-col w-full h-full space-y-0">
      <div className="px-4 pt-28 md:px-16 md:pt-36">
        <BrowseTabs />
      </div>
    </Stack>
    <Footer />
  </Container>
  )
}

export default BrowsePage


const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;