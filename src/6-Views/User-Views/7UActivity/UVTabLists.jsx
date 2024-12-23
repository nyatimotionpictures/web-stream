
import { Box, Stack, Typography } from '@mui/material';
import React from 'react'
import Button from '../../../2-Components/Buttons/Button';


const UVTabLists = ({type}) => {
  return (
    <div className="w-full">
      {type === "Watched" && (
        <Stack spacing="20px" className='flex flex-col gap-4 max-w-full'>
          <Stack className="border-b-2 pb-4 border-b-secondary-500 min-h-[52px] flex flex-row items-center justify-between ">
            <Box className="flex flex-row gap-4 md:gap-10 flex-grow-1 text-whites-40 overflow-hidden">
              <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                8 Sep, 2020
              </Typography>
              <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                Addams Family Values
              </Typography>
            </Box>
            <Box className="flex flex-row items-center gap-2 md:gap-10 flex-grow-1">
              <div className=" w-max h-max text-primary-500 px-2 py-1 border border-primary-500 rounded-lg bg-secondary-800 ">
                Movie
              </div>

              <Button
                variant="ghost"
                className="flex text-whites-40 px-2 py-1 items-center"
              >
                <span className="icon-[solar--trash-bin-trash-linear] h-6 w-6"></span>
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}

      {type === "Watchlist" && (
        <Stack spacing="20px" className='flex flex-col gap-4 max-w-full'>
          <Stack className="border-b-2 pb-4 border-b-secondary-500 min-h-[52px] flex flex-row items-center justify-between ">
            <Box className="flex flex-row gap-4 md:gap-10 flex-grow-1 text-whites-40">
              <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                8 Sep, 2020
              </Typography>
              <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                Addams Family Values
              </Typography>
            </Box>
            <Box className="flex flex-row items-center gap-2 md:gap-10 flex-grow-1">
              <div className=" w-max h-max text-primary-500 px-2 py-1 border border-primary-500 rounded-lg bg-secondary-800 ">
                Movie
              </div>

              <Button
                variant="ghost"
                className="flex text-whites-40 px-2 py-1 items-center"
              >
                <span className="icon-[solar--trash-bin-trash-linear] h-6 w-6"></span>
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}

      {type === "Rated" && (
        <Stack spacing="20px" className='flex flex-col gap-4 max-w-full'>
          <Stack className="border-b-2 pb-4 border-b-secondary-500 min-h-[52px] flex flex-row items-center justify-between ">
            <Box className="flex flex-row gap-4 md:gap-10 flex-grow-1 text-whites-40">
              <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                8 Sep, 2020
              </Typography>
              <Typography className="font-[Inter-Regular] line-clamp-3 text-clip text-sm">
                Addams Family Values 
              </Typography>
            </Box>
            <Box className="flex flex-row items-center gap-2 md:gap-10 flex-grow-1">
              <Button
                variant="ghost"
                className="flex text-whites-40 px-2 py-1 items-center"
              >
                <span className="icon-[solar--like-broken] h-6 w-6"></span>
              </Button>
              <div className=" hidden w-max h-max text-primary-500 px-2 py-1 border border-primary-500 rounded-lg bg-secondary-800 ">
                Movie
              </div>

              <Button
                variant="ghost"
                className="flex text-whites-40 px-2 py-1 items-center"
              >
                <span className="icon-[solar--trash-bin-trash-linear] h-6 w-6"></span>
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}
    </div>
  );
}

export default UVTabLists