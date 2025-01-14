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

const SegmentTab = ({
  filmdata,
  openModal,
  setSelectedTrailer,
  openLocalModal,
}) => {
  const [seasonData, setSeasonData] = React.useState([]);
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
    </Container>
  );
};

export default SegmentTab;

const Container = styled(Stack)`
  img {
    image-rendering: auto !important;
  }
`;
