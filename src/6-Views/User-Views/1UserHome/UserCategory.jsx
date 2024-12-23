import { Stack, Typography } from '@mui/material';
import React from 'react'
import styled from 'styled-components';
import MovieCarousel from '../../../2-Components/Carousels/MovieCarousel';
import Button from '../../../2-Components/Buttons/Button';

const UserCategory = () => {
  return (
    <Container className="w-full bg-[#141118] py-16  overflow-hidden" >
        {/** start watching */}
      <div className="w-full mx-auto flex flex-row md:gap-10 lg:gap-16  xl:gap-24 items-start">
        <Stack spacing={"20px"} className="pl-2 lg:pl-16 flex-col w-full">
          <Typography className="text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[22px] text-left">
            Start Watching
          </Typography>

          <div className="flex w-full  gap-0 items-center justify-center mx-auto !overflow-hidden">
            <MovieCarousel />
          </div>
        </Stack>
      </div>

      <Stack className="flex flex-col space-y-9">
        {/** Top picks */}
        <div className="w-full mx-auto flex  md:gap-10 lg:gap-16  xl:gap-24 items-start">
          <Stack spacing={"20px"} className="pl-2 lg:pl-16 flex-col w-screen">
            <Typography className="text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[22px] text-left">
              Top picks for you
            </Typography>

            <Stack className="flex w-full  gap-0 items-center justify-center mx-auto !overflow-hidden">
            <MovieCarousel cardtype="genre" />
            </Stack>
          </Stack>
        </div>
        {/** Genres */}
        <div className="w-full mx-auto block md:gap-10 lg:gap-16  xl:gap-24 items-start">
          <Stack spacing={"20px"} className="pl-2 lg:pl-16 flex-col">
            <Stack className="flex-row space-x-3 items-center">
              <Typography className="text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[18px] text-left">
                Docuseries
              </Typography>

              <Button
                variant="ghost"
                className="flex items-center text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[18px] text-left hover:text-primary-500 py-0"
              >
                See more{" "}
                <span className="icon-[solar--alt-arrow-right-broken] w-6 h-6"></span>
              </Button>
            </Stack>

            <Stack className="flex w-full  gap-0 items-center justify-center mx-auto">
            <MovieCarousel cardtype="genre" />
            </Stack>
          </Stack>
        </div>
        {/** kids */}
        <div className="w-full mx-auto block md:gap-10 lg:gap-16  xl:gap-24 items-start">
          <Stack spacing={"20px"} className="pl-2 lg:pl-16 flex-col">
            <Stack className="flex-row space-x-3 items-center">
              <Typography className="text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[18px] text-left">
                Family
              </Typography>

              <Button
                variant="ghost"
                className="flex items-center text-[#FFFAF6] font-[Inter-SemiBold] opacity-[100%] text-[18px] text-left hover:text-primary-500 py-0"
              >
                See more{" "}
                <span className="icon-[solar--alt-arrow-right-broken] w-6 h-6"></span>
              </Button>
            </Stack>

            <Stack className="flex w-full  gap-0 items-center justify-center mx-auto">
            <MovieCarousel cardtype="genre" />
            </Stack>
          </Stack>
        </div>
      </Stack>
    </Container>
  )
}

export default UserCategory

const Container = styled.section`
  min-height: 44vh;

  background-size: cover;
`;