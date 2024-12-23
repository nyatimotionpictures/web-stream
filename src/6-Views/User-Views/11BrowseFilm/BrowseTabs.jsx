import React from 'react'
import BrowseTabAll from './BrowseTabAll';
import BrowseTabFilms from './BrowseTabFilms';
import BrowseTabShows from './BrowseTabShows';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { FormContainer, SingleWrapper } from '../../../2-Components/Stacks/InputFormStack';


const BrowseTabs = () => {
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
  const [query, setQuery] = React.useState('');

  const TabDisplay = (datakey) => {
    switch (datakey) {
      case "All":
        return <BrowseTabAll  loggedIn={true} />;
      case "Films":
        return <BrowseTabFilms  loggedIn={true} />;
      case "TV shows":
        return <BrowseTabShows  loggedIn={true} />;
      
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
        {/* <Typography className="font-[Inter-SemiBold] text-xl text-whites-40">
        Watchlist
      </Typography> */}
        {/* search */}

        <SingleWrapper>
          <FormContainer >
            <div className="flex flex-col gap-2 h-full relative justify-center">
              <div className="w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 left-3  m-auto hover:text-primary-500  z-50">
                <span className="icon-[solar--minimalistic-magnifer-broken] text-whites-100 w-5 h-5"></span>
              </div>

              <input
                type="text"
                placeholder="Search"
                className="pl-10 w-full text-whites-40 rounded-full border ring-2-secondary-100  py-3 px-5 text-base text-white outline-none placeholder:text-whites-40 focus:border-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 "
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            
          </FormContainer>
        </SingleWrapper>

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
              <TabPanel className='px-0' key={index} value={data.position}>
                {TabDisplay(data.title)}
              </TabPanel>
            );
          })}
        </TabContext>
      </Stack>
    </div>
  );
}

export default BrowseTabs