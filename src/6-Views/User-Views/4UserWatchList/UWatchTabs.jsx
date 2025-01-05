
import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import { Tabs, Tab } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
// import styled from "styled-components";
import TabAll from "./TabAll";
import TabMovies from "./TabMovies";
import TabShows from "./TabShows";

const UWatchTabs = ({allWatched, filmsWatched, showsWatched, itemsPerPage, setItemsPerPage}) => {
  const [currentTabValue, setCurrentTabValue] = React.useState("one");
  const [displayTabs, setDisplayTabs] = React.useState([
    {
      title: "All",
      position: "one",
    },
    {
      title: "Films",
      position: "two",
    },
    {
      title: "TV shows",
      position: "three",
    },
  ]);

  const TabDisplay = (datakey) => {
    switch (datakey) {
      case "All":
        return <TabAll  allWatched={allWatched} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} loggedIn={true} />;
      case "Films":
        return <TabMovies filmsWatched={filmsWatched} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}  loggedIn={true} />;
      case "TV shows":
        return <TabShows showsWatched={showsWatched} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} loggedIn={true} />;
      
      default:
        break;
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTabValue(() => newValue);
  };
  return (
    <div className="min-h-[54vh] h-full  bg-secondary-800">
      <Stack className="flex flex-col">
        <Typography className="font-[Inter-SemiBold] text-xl text-whites-40">
          Watchlist
        </Typography>

        <TabContext value={currentTabValue !== null && currentTabValue}>
          <Box className="w-full space-x-5">
            <Tabs
              value={currentTabValue !== null && currentTabValue}
              onChange={handleTabChange}
              sx={{ margin: "4px" }}
            >
              {displayTabs.map((data, index) => {
                return (
                  <Tab
                    className="text-whites-40 mr-2 sm:mr-6 font-[Inter-SemiBold] capitalize text-sm sm:text-base"
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
              <TabPanel className="px-0" key={index} value={data.position}>
                {TabDisplay(data.title)}
              </TabPanel>
            );
          })}
        </TabContext>
      </Stack>
    </div>
  );
};

export default UWatchTabs;