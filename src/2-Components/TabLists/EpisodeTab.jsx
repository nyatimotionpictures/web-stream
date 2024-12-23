//import { Stack } from '@chakra-ui/react';
import React from 'react'
import styled from 'styled-components';
import EpisodeContent from './EpisodeContent';
import { Stack, Typography } from '@mui/material';




const EpisodeTab = ({
    filmdata,
    openModal,
    setSelectedTrailer,
    openLocalModal,
}) => {
    const [seasonData, setSeasonData] = React.useState([]);
    //console.log("filmData", filmdata.seasons);

    React.useEffect(() => {
        if (filmdata?.seasons ) {
            setSeasonData(() => filmdata?.seasons);
        } else {
            setSeasonData(() => []);
        }

        return () => {
            setSeasonData(() => []);
        }
      
    }, [filmdata, filmdata?.title, filmdata?.filmType, filmdata?.seasons]);
  return (
      <Container>
          {seasonData?.length > 0 && filmdata?.seasons  ? (
              <>
                  {filmdata?.seasons[0]?.episodes?.length > 0 && (
                      <Stack  className="flex flex-col gap-[63px]">
                          {filmdata?.seasons[0]?.episodes?.map((data, index) => {
                              return (
                                  <EpisodeContent
                                      openModal={openModal}
                                      key={index}
                                      seriesdata={filmdata?.seasons[0]}
                                      episodedata={data}
                                      setSelectedTrailer={setSelectedTrailer}
                                      openLocalModal={openLocalModal}
                                  />
                              );
                          })}
                      </Stack>
                  )}
              </>
          ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[30vh] bg-secondary-300">
                  <Typography className="text-whites-40 font-[Inter-Bold] text-2xl">
                      No episodes uploaded
                  </Typography>
              </div>
          )}
          
       
      </Container>
  )
}

export default EpisodeTab
const Container = styled(Stack)`
  img {
    image-rendering: auto !important;
  }
`;