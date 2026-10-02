import { Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import CustomStack from "../Stacks/CustomStack";
import Button from "../Buttons/Button";
import Logo from "../../1-Assets/logos/Logo.svg";

/**
 * Shown when a film, series, season or episode cannot be loaded.
 *
 * These pages are reached from shared links, so a retired slug or a mistyped id
 * used to land on an empty hero with no explanation. The api answers 404 for an
 * unknown identifier, which surfaces here as a query error.
 *
 * @param {string} [title] what was missing, e.g. "Season not found"
 * @param {string} [description] extra line under the heading
 * @param {string} [backLabel] label for the way back
 */
const ContentNotFound = ({
  title = "We could not find that title",
  description = "The link may be mistyped, or the title may have been removed.",
  backLabel = "Go back",
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-secondary-800 overflow-hidden">
      <div className="relative flex items-center justify-center h-screen w-full px-5 text-center shadow-xl">
        <div className="bg-secondary-900 px-5 md:px-16 py-10 w-full max-w-[700px] rounded-lg flex flex-col gap-6 items-center">
          <CustomStack className="mx-0 mt-0 select-none cursor-pointer w-10 h-10">
            <img src={Logo} alt="" className="w-full h-full" />
          </CustomStack>

          <Stack spacing={"8px"} className="flex flex-col items-center">
            <span className="icon-[solar--compass-bold-duotone] h-12 w-12 text-primary-500" />

            <Typography className="text-center text-3xl font-[Inter-Bold] text-whites-40 text-opacity-100">
              404
            </Typography>

            <Typography className="text-center text-lg font-[Inter-Medium] text-whites-40 text-opacity-100">
              {title}
            </Typography>

            <Typography className="text-center text-sm font-[Inter-Regular] text-whites-40 text-opacity-70">
              {description}
            </Typography>
          </Stack>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <Button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto min-w-[140px] rounded-full border-2 border-[#706e72] bg-transparent text-whites-40 font-[Roboto-Regular] text-sm sm:text-base"
            >
              {backLabel}
            </Button>

            <Button
              onClick={() => navigate("/browse")}
              className="w-full sm:w-auto min-w-[140px] rounded-full border-2 border-primary-500 bg-transparent text-whites-40 font-[Roboto-Regular] text-sm sm:text-base"
            >
              Browse titles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentNotFound;