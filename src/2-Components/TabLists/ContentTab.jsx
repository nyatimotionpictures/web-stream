//import { Stack } from '@chakra-ui/react';
import { Stack, Typography } from '@mui/material';
import React from 'react';
import styled from 'styled-components';
// import FooterWatch from '../Footer/FooterWatch';
// import FEventsSection from '../Sections/FEventsSection';

const ContentTab = ({ filmdata, loggedIn }) => {
  return (
    <Container>
      <Stack direction="column" spacing={"12px"} className="px-0">
        {/** overview */}
        {filmdata?.overview && (
          <OverviewContainer spacing={"7px"}>
            <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
              Overview
            </Typography>
            <Typography className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72] text-justify">
              {filmdata?.overview}
            </Typography>
          </OverviewContainer>
        )}
        <GridContainer>
          <GridColumn>
            {/** Starring */}
            {filmdata?.actors?.length > 0 && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Starring
                </Typography>
                <ul>
                  {filmdata?.actors?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** Runtime */}
            {filmdata?.runtime && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Runtime
                </Typography>
                <Typography className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]">
                  {filmdata?.runtime}
                </Typography>
              </Stack>
            )}
            {/** Audio Languages */}
            {filmdata?.audioLanguages?.length > 0 && (
              <Stack spacing={"14px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Audio Languages
                </Typography>
                <ul>
                  {filmdata?.audioLanguages?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706e72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** subtitles */}
            {filmdata?.subtitleLanguages && (
                  <Stack spacing={"7px"}>
                      <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                          Subtitles
                      </Typography>
                      <Typography className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]">
                          {filmdata?.subtitles}
                      </Typography>
                  </Stack>
              )}

          </GridColumn>

          <GridColumn>
            {/** Writers */}
            {filmdata?.writers?.length > 0 && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Writers
                </Typography>
                <ul>
                  {filmdata?.writers?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** Sound Core */}
            {filmdata?.soundcore?.length > 0 && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Sound Core
                </Typography>
                <ul>
                  {filmdata?.soundcore?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** Directors */}
            {filmdata?.directors?.length > 0 && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Directors
                </Typography>
                <ul>
                  {filmdata?.directors?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** Producers */}
            {filmdata?.producers?.length > 0 && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Producers
                </Typography>
                <ul>
                  {filmdata?.producers?.map((data, index) => (
                    <span
                      key={index}
                      className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]"
                    >
                      {(index ? ", " : "") + data}
                    </span>
                  ))}
                </ul>
              </Stack>
            )}
            {/** Year Of Production */}
            {filmdata?.yearOfProduction && (
              <Stack spacing={"7px"}>
                <Typography className="font-[Inter-SemiBold] text-base sm:text-lg text-whites-40">
                  Year of Production
                </Typography>
                <Typography className="font-[Inter-Regular] text-[14px] sm:text-base text-[#706E72]">
                  {filmdata?.yearOfProduction}
                </Typography>
              </Stack>
            )}
          </GridColumn>
        </GridContainer>
      </Stack>
            
      {/* {filmdata?.title === "Tuko Pamoja" && (
        <FEventsSection />
      )} */}

      {/* {!loggedIn && <FooterWatch />} */}
    </Container>
  );
};

export default ContentTab;

const Container = styled(Stack)`
`;

const OverviewContainer = styled(Stack)`
  max-width: 650px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
  max-width: 650px;
`;

const GridColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 650px;
`;
