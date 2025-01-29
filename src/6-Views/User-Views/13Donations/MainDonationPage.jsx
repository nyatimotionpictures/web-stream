import { Stack } from '@mui/material';
import React from 'react'
import styled from 'styled-components';
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import Footer from '../../../2-Components/Footer/Footer';
import DHelpSection from './DHelpSection';
import DAmountSection from './DAmountSection';
import UpcomingFilmDonations from './UpcomingFilmDonations';
import { useGetAllFilms } from '../../../5-Store/TanstackStore/services/queries';

const MainDonationPage = () => {
  const [comingSoonFilms, setComingSoonFilms] = React.useState([]);
  let filmsQuery = useGetAllFilms();

  React.useEffect(() => {
    if (filmsQuery?.data?.films) {
      let comingSoonFilms = filmsQuery?.data?.films.filter(
        (film) => film?.visibility === "coming soon"
      );
      setComingSoonFilms(() => comingSoonFilms);
    }
  }, [filmsQuery?.data?.films]);

  console.log("filmsQuery", filmsQuery?.data?.films);
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
        <WebNavigation isLoggedIn={true} />

        <Stack className="flex-col w-full h-full space-y-0">
            <DHelpSection />
            <UpcomingFilmDonations films={comingSoonFilms} />
            <DAmountSection />
          
        </Stack>
        <Footer />
    </Container>
  )
}

export default MainDonationPage

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;