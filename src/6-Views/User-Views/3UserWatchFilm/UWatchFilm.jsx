
import React from 'react'
import styled from 'styled-components';
import FullCustomPlayer from './FullCustomPlayer';
import videoTest from '../../../1-Assets/videotest/AppReview.mp4'
import { Player } from "video-react";
const UWatchFilm = () => {
  return (
    <Container className="w-screen h-screen bg-secondary-900 overflow-hidden relative">
      <FullCustomPlayer videoSrc={videoTest}  />
    </Container>
  );
}

export default UWatchFilm

const Container = styled.div``