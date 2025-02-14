//import { Stack } from '@chakra-ui/react';
import React from 'react'
import styled from 'styled-components';
import EpisodeContent from '../Cards/EpisodeContent';
import { Stack, Typography } from '@mui/material';


const EpisodeTab = ({
    filmdata,
    openModal,
    setSelectedTrailer,
    openLocalModal,
    handlePaymentModel,
    
}) => {
    const [seasonData, setSeasonData] = React.useState([]);
    const [selectedSeason, setSelectedSeason] = React.useState(null);
    // console.log("filmData", filmdata);

    React.useEffect(() => {
        if (filmdata ) {
            // setSeasonData(() => filmdata);
            setSelectedSeason(() => filmdata)
        } else {
            setSeasonData(() => null);
            setSelectedSeason(() => null);
        }

        return () => {
            setSeasonData(() => null);
            setSelectedSeason(() => null);
        }
      
    }, [filmdata, filmdata?.title, filmdata?.filmType, filmdata?.season]);
  return (
    <Container>
      {selectedSeason !== null && filmdata !== null ? (
        <div className="flex flex-col gap-4 w-full">
       
          {filmdata?.episodes?.length > 0 && (
            <Stack className="flex flex-col gap-[63px]">
              {selectedSeason?.episodes?.map((data, index) => {
                if(data?.visibility === 'published'){
                return (
                  <EpisodeContent
                    openModal={openModal}
                    key={index}
                    seasondata={selectedSeason}
                    episodedata={data}
                    setSelectedTrailer={setSelectedTrailer}
                    openLocalModal={openLocalModal}
                    handlePaymentModel={handlePaymentModel}
                  />
                );
              }
              })}
            </Stack>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center min-h-[30vh] bg-secondary-300">
          <Typography className="text-whites-40 font-[Inter-Bold] text-2xl">
            No episodes uploaded
          </Typography>
        </div>
      )}
    </Container>
  );
}

export default EpisodeTab
const Container = styled(Stack)`
  img {
    image-rendering: auto !important;
  }
`;

const EpisodeFormContainer = styled.div`
    && select {
    height: 40px;
    padding: 0 10px;
    margin:0;
    border-radius: 4px;
    background-color: #443F4D !important;
    
    }

    && .MuiOutlinedInput-notchedOutline {
        border: none !important;
        
    }

    && .MuiOutlinedInput-root {
        border: none !important;
         color: white !important;
      
    }
        && .MuiSelect-icon {
        color: white !important;
        }

     
`;