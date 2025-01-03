import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import Button from "../../../2-Components/Buttons/Button";
import moment from "moment-timezone";

const UVTabLists = ({ type, watchlistData }) => {
  return (
    <div className="w-full">
      {type === "Watched" && (
        <Stack spacing="20px" className="flex flex-col gap-4 max-w-full">
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
        <Stack spacing="20px" className="flex flex-col gap-4 max-w-full">
          {watchlistData?.length > 0 ? (
            <>
              {watchlistData?.map((data, index) => {
                
                return (
                  <Stack key={data?.id} className="border-b-2 pb-4 border-b-secondary-500 min-h-[52px] flex flex-row items-center justify-between ">
                    <Box className="flex flex-row gap-4 md:gap-10 flex-grow-1 text-whites-40">
                      <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                        {
                          data?.releaseDate ? moment(data?.releaseDate).format("DD MMM, YYYY") : ""
                        }
                      </Typography>
                      <Typography className="font-[Inter-Regular] line-clamp-3 text-sm">
                        {data?.title}
                      </Typography>
                    </Box>
                    <Box className="flex flex-row items-center gap-2 md:gap-10 flex-grow-1">
                      
                      <div className=" w-max h-max text-primary-500 px-2 py-1 border border-primary-500 rounded-lg bg-secondary-800 ">
                        {
                          data?.type !== "series" && data?.type !== "movie" ? "episode" : data?.type 
                        }
                      </div>

                      <Button
                        variant="ghost"
                        className="flex text-whites-40 px-2 py-1 items-center"
                      >
                        <span className="icon-[solar--trash-bin-trash-linear] h-6 w-6"></span>
                      </Button>
                    </Box>
                  </Stack>
                );
              })}
            </>
          ) : (
            <Box className="h-[100%]">
              <Stack className="flex flex-col h-full w-full min-h-[45vh] items-center justify-center my-auto">
                <Typography className="text-whites-40 font-[Inter-Medium] text-lg">
                  Your Watchlist is currently empty
                </Typography>
                <Typography className="text-whites-40 font-[Inter-Medium] text-lg max-w-[480px] text-center">
                  Add <span className="underline">TV shows</span> and{" "}
                  <span className="underline">Movies</span> that you want to
                  watch later by clicking Add to{" "}
                  <span className="underline">Watchlist</span>.
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      {type === "Rated" && (
        <Stack spacing="20px" className="flex flex-col gap-4 max-w-full">
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
};

export default UVTabLists;
