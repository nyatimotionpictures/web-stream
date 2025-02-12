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
    console.log("filmData", filmdata);

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
          {/* <EpisodeFormContainer className="flex flex-col gap-2 w-[200px] font-[Inter-Regular] !text-base !text-whites-40">
          
            <Select
              className=" h-[40px] bg-secondary-300 bg-opacity-65 text-base text-whites-40 capitalize font-[Inter-Regular] outline-none border-none focus:outline-none focus:border-none md:text-xl"

              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: "#24222A",
                    
                    textIndent: "10px",
                    fontSize: "initial",
                    fontFamily: "Inter-Regular",
                    color: "white",
                  },
                },
              }}
            
              value={selectedSeason?.id}
              onChange={(e) =>
                setSelectedSeason(
                  filmdata?.season.find((data) => data?.id === e.target.value)
                )
              }
            >
              {filmdata?.season?.map((data, index) => {
                return (
                  <option key={data?.id} value={data?.id}>
                    {data?.title} {data?.season}
                  </option>
                );
              })}
            </Select>
          </EpisodeFormContainer> */}
          {filmdata?.episodes?.length > 0 && (
            <Stack className="flex flex-col gap-[63px]">
              {selectedSeason?.episodes?.map((data, index) => {
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