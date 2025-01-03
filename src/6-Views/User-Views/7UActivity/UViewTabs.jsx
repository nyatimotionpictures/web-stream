
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import UVTabLists from "./UVTabLists";
import { TabContext, TabPanel } from "@mui/lab";

const UViewTabs = ({watchlistData}) => {
 const [currentTabValue, setCurrentTabValue] = React.useState("one");
 const [displayTabs, setDisplayTabs] = React.useState([
   {
     title: "Watched",
     position: "one",
   },
   {
     title: "Watchlist",
     position: "two",
   },
   {
     title: "Rated",
     position: "three",
   },
 ]);

      const TabDisplay = (datakey) => {
        switch (datakey) {
          case "Watched":
            return <UVTabLists type={"Watched"} loggedIn={true} />;
          case "Watchlist":
            return <UVTabLists type={"Watchlist"} watchlistData={watchlistData} loggedIn={true} />;
          case "Rated":
            return <UVTabLists type={"Rated"} loggedIn={true} />;

          default:
            break;
        }
      };
    const handleTabChange = (event, newValue) => {
      setCurrentTabValue(() => newValue);
    };
  return (
    <div className="min-h-[54vh] h-full  ">
      <Stack className="flex flex-col">
        {/**  title */}
        <Box className="flex flex-col space-y-2">
          <Typography className="font-[Inter-SemiBold] text-base md:text-xl text-whites-40">
            My Viewing Activity
          </Typography>
          <Typography className="font-[Inter-Medium] text-sm md:text-base text-whites-40 text-opacity-[60%]">
            Manage viewing history, Watchlist and ratings
          </Typography>
        </Box>

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
                    className="text-whites-40 mr-1 sm:mr-6 font-[Inter-SemiBold] capitalize text-sm md:text-base"
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

export default UViewTabs;