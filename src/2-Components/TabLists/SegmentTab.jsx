//import { Stack } from '@chakra-ui/react';
import React from "react";
import styled from "styled-components";
import {
  Autocomplete,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomStack from "../Stacks/CustomStack";
import { FormContainer } from "../Stacks/InputFormStack";
import SegmentCard from "../Cards/SegmentCard";
import TestHeroTrailerPlayer from "../../2-Components/VideoPlayer/TestHeroPlayer5";

const SegmentTab = ({
  filmdata,
  openModal,
  setSelectedTrailer,
  openLocalModal,
}) => {
  const [seasonData, setSeasonData] = React.useState([]);
  const [trailerDialogOpen, setTrailerDialogOpen] = React.useState(false);
  const [trailerUrl, setTrailerUrl] = React.useState("");
  const [resourceId, setResourceId] = React.useState("")

  const handleOpenTrailer = (id) => {
    setResourceId(id)
    // setTrailerUrl(url);
    setTrailerDialogOpen(true);
  };
  const handleCloseTrailer = () => {
    setTrailerDialogOpen(false);
    setTrailerUrl("");
    setResourceId("")
  };

  React.useEffect(() => {
    if (filmdata?.season) {
      setSeasonData(() => filmdata?.season);
    } else {
      setSeasonData(() => []);
    }

    return () => {
      setSeasonData(() => []);
    };
  }, [filmdata, filmdata?.title, filmdata?.filmType, filmdata?.season]);

  const handleVideoEnded = () => {
    // console.log('🎬 UMobileHero: Trailer ended, hiding video and setting played state');
    // setShowVideo(false);
    // setIsVideoPlayed(true);
    //setIsVideoVisible(false); // Reset visibility when video ends
  };

  const handleReplayVideo = () => {
    // console.log('🎬 UMobileHero: Replay requested, showing video again');
    //setIsVideoPlayed(false);
    //setShowVideo(true);
    //setIsVideoVisible(true); // Set video as visible when replaying
    //setIsVideoPaused(false); // Ensure video is not paused when replaying
  };

  const handleVideoError = (error) => {
    // console.error('🎬 UMobileHero: Trailer error:', error);
    // setShowVideo(false);
  };

  const handleVideoLoaded = () => {
    // console.log('🎬 UMobileHero: Trailer loaded successfully');
  };

  const handleVideoPlay = () => {
    // console.log('🎬 UMobileHero: Video started playing');
    // setIsVideoPaused(false);
  };

  const handleVideoPause = () => {
    // console.log('🎬 UMobileHero: Video paused');
    // setIsVideoPaused(true);
  };


  return (
    <Container>
      {seasonData?.length > 0 && filmdata?.season ? (
        <div className="flex flex-col gap-4 w-full">
          {filmdata?.season?.length > 0 && (
            <Stack className="flex flex-col gap-[63px]">
              {filmdata?.season?.map((data, index) => {
                return (
                  <SegmentCard
                    openModal={openModal}
                    key={index}
                    seasondata={data}
                    setSelectedTrailer={setSelectedTrailer}
                    openLocalModal={openLocalModal}
                    onOpenTrailer={handleOpenTrailer}
                  />
                );
              })}
            </Stack>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center min-h-[30vh] bg-secondary-300">
          <Typography className="text-whites-40 font-[Inter-Bold] text-2xl">
            No segments / seasons uploaded
          </Typography>
        </div>
      )}

      {/* Trailer Modal */}
      {trailerDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900 bg-opacity-90"
        >
          <button
            onClick={handleCloseTrailer}
            className="absolute top-6 right-6 z-50 bg-primary-500/70 text-white rounded-full p-4 hover:bg-opacity-90 transition-all duration-200 hover:scale-110 text-base font-medium"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            Close
          </button>
          {/* <video
            src={trailerUrl}
            controls
            autoPlay
            className="trailer-modal-video w-screen h-screen object-contain bg-black"
            onEnded={handleCloseTrailer}
            onError={(e) => {
              console.error('Video error:', e);
              handleCloseTrailer();
            }}
          >
            Your browser does not support the video tag.
          </video> */}
           <TestHeroTrailerPlayer
              key={resourceId} // Force re-render when film changes
              resourceId={resourceId}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onLoaded={handleVideoLoaded}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              
              autoPlay={false}
              muted={false}
              loop={false}
              
              showControls={true}
              isVisible={true}
              className="w-full h-full"
              style={{
                width: '100%',
                height: '100%'
              }}
              isTrailer={true}
            />
        </div>
      )}
    </Container>
  );
};

export default SegmentTab;

const Container = styled(Stack)`
  img {
    image-rendering: auto !important;
  }
`;
