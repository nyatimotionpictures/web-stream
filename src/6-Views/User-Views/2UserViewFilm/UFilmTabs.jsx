import React from "react";
import { Tabs, Tab, Box, Stack } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import styled from "styled-components";
// import { Box, Stack } from "@chakra-ui/react";
import ContentTab from "../../../2-Components/TabLists/ContentTab";
import MoreLikeTab from "../../../2-Components/TabLists/MoreLikeTab";
import EpisodeTab from "../../../2-Components/TabLists/EpisodeTab";
import ExploreTab from "../../../2-Components/TabLists/ExploreTab";
import SegmentTab from "../../../2-Components/TabLists/SegmentTab";


const UFilmTabs = ({ filmData, allSeasonData }) => {
    const [filmType, setFilmType] = React.useState(null);
    const [loadingFilmData, setLoadingFilmData] = React.useState(true);
    const [currentTabValue, setCurrentTabValue] = React.useState(null);
    const [displayTabs, setDisplayTabs] = React.useState([]);

    console.log(filmData?.type )
    React.useEffect(() => {
      if (filmData !== null) {
        if (
          filmData?.type?.toLowerCase() === "movie" ||
          filmData?.type?.toLowerCase()?.includes("film") || filmData?.type?.toLowerCase() === 'episode'
        ) {
          setFilmType(() => filmData?.type );
          setDisplayTabs(() => [
            {
              title: "Details",
              position: "one",
            },
            {
              title: "More like",
              position: "two",
            },
          ]);
          setCurrentTabValue(() => "one");
        } else if (
          filmData?.type?.toLowerCase() === "series" ||
          filmData?.type?.toLowerCase() === "segments" ||
          filmData?.type?.toLowerCase().includes("series")
        ) {
          setFilmType(() => filmData?.type);
          setDisplayTabs(() => [
            {
              title: "Segments",
              position: "one",
            },
            {
              title: "Details",
              position: "two",
            },
            {
              title: "More like",
              position: "three",
            },
            filmData?.InTheatres?.length > 0 && {
              title: "Explore",
              position: "four",
            },
          ]);
          setCurrentTabValue(() => "one");
        } else {
          setFilmType(() => filmData?.type);
          setDisplayTabs(() => [
            {
              title: "Episodes",
              position: "one",
            },
            {
              title: "Details",
              position: "two",
            },
            {
              title: "More like",
              position: "three",
            },
            filmData?.InTheatres?.length > 0 && {
              title: "Explore",
              position: "four",
            },
          ]);
          setCurrentTabValue(() => "one");
        }
      } else {
        setFilmType(() => null);
      }

      return () => {
        setLoadingFilmData(true);
        setFilmType(() => null);
      };
    }, [filmData]);

    const handleTabChange = (event, newValue) => {
      setCurrentTabValue(() => newValue);
    };

    const TabDisplay = (datakey) => {
      switch (datakey) {
        case "Details":
          return <ContentTab filmdata={filmData} loggedIn={true} />;
        case "More like":
          return <MoreLikeTab filmdata={filmData} allSeasonData={allSeasonData} loggedIn={true} />;
          case "Segments":
          return <SegmentTab filmdata={filmData} loggedIn={true} />;
        case "Episodes":
          return <EpisodeTab filmdata={filmData} loggedIn={true} />;
        case "Explore":
          return <ExploreTab filmdata={filmData} loggedIn={true} />;
        default:
          break;
      }
    };
  return (
    <Container className="min-h-[60vh] ">
      {displayTabs?.length > 0 && (
        <TabContext value={currentTabValue !== null && currentTabValue}>
          <Box className="w-screen space-x-5">
            <Tabs
              value={currentTabValue !== null && currentTabValue}
              onChange={handleTabChange}
              sx={{ margin: "4px" }}
            >
              {displayTabs.map((data, index) => {
                return (
                  <Tab
                    className="text-whites-40 mr-6 font-[Inter-SemiBold] capitalize text-base"
                    key={index}
                    value={data.position}
                    label={data.title}
                  />
                );
              })}
            </Tabs>
          </Box>

          {displayTabs.map((data, index) => {
            return (
              <TabPanel key={index} value={data.position}>
                {TabDisplay(data.title)}
              </TabPanel>
            );
          })}
        </TabContext>
      )}
    </Container>
  );
};

export default UFilmTabs;

const Container = styled(Stack)``;