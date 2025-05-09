import React, { useEffect } from "react";
import Button from "../../../../2-Components/Buttons/Button";
import { Divider, Slider, Typography } from "@mui/material";
import formatDuration from "./formatDuration";

const subtitles = [
  { id: "english", name: "English" },
  { id: "spanish", name: "Spanish" },
  { id: "french", name: "French" },
];

const PlayerControls = ({
  videoRef,
  togglePlayPause,
  duration,
  currentTime,
  isVideoPlaying,
  setIsVideoPlaying,
  handleFullScreen,
  isFullScreen,
  replayVideo,
  handleVolumeChange,
  volumestate,
  handleMuteVideo,
  isVideoMuted,
  allVideos,
  handleResolution,
  videoSrc,
  setIsLoading,
  subtitle = "off",
  handleExitFullScreen,
}) => {
  //  const [volumestate, setVolumeState] = React.useState(40);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isSubtitleMenuOpen, setIsSubtitleMenuOpen] = React.useState(false);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  let volumeRef = React.useRef();

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResolutionChange = (video) => {
    if (videoRef.current) {
      // const currentTime = videoRef.current.currentTime; // Save current time
      // const isPlaying = !videoRef.current.paused;

      setIsVideoPlaying(false);
      handleResolution(video);
      setIsLoading(true);

      videoRef.current.onloadedmetadata = () => {
        // videoRef.current.currentTime = currentTime; // Restore playback time
        // if (isPlaying) videoRef.current.play(); // Resume playback if it was playing
        videoRef.current.play();
        setIsVideoPlaying(true);
        setIsLoading(false);
      };
    }
    setIsMenuOpen(!isMenuOpen);
    setIsSubtitleMenuOpen(false);
    setIsQualityMenuOpen(false);
    setAnchorEl(null);
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(setAnchorEl);
    setIsMenuOpen(!isMenuOpen);
    handleSubSettingsClose();
  };

  const handleSubtitlesOpen = () => {
    setIsSubtitleMenuOpen(true);
  };

  const handleQualityOpen = () => {
    setIsQualityMenuOpen(true);
  };
  const handleSubSettingsClose = () => {
    setIsSubtitleMenuOpen(false);
    setIsQualityMenuOpen(false);
  };

  useEffect(() => {
    if (allVideos.length > 0) {
      const order = ["SD", "HD", "FHD", "UHD"];
      allVideos.sort(
        (a, b) => order.indexOf(a.resolution) - order.indexOf(b.resolution)
      );
    }

    return () => {};
  }, [allVideos]);

  return (
    <div className="w-full flex flex-row justify-between items-center ">
      <div className="flex flex-row gap-4 items-center">
        {/** Play btn */}
        {isVideoPlaying ? (
          <Button
            onClick={togglePlayPause}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--pause-bold] h-6 w-6  text-whites-40"></span>
          </Button>
        ) : (
          <Button
            onClick={togglePlayPause}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--play-bold] h-6 w-6  text-whites-40"></span>
          </Button>
        )}

        <Button
          onClick={replayVideo}
          className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
        >
          <span className="icon-[solar--restart-bold] h-6 w-6  text-whites-40"></span>
        </Button>

        <div className="flex flex-row items-center gap-2 md:gap-4">
          {/** volume slider */}
          <div className="flex flex-row gap-1 sm:gap-4 items-center">
            <Button
              onClick={handleMuteVideo}
              className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
            >
              {volumestate >= 80 && !isVideoMuted && (
                <span className="icon-[solar--volume-loud-bold] h-6 w-6  text-whites-40"></span>
              )}
              {volumestate < 80 && volumestate >= 30 && !isVideoMuted && (
                <span className="icon-[solar--volume-small-bold] h-6 w-6  text-whites-40"></span>
              )}
              {volumestate < 30 && volumestate >= 1 && !isVideoMuted && (
                <span className="icon-[solar--volume-bold] h-6 w-6  text-whites-40"></span>
              )}

              {volumestate <= 0 || isVideoMuted ? (
                <span className="icon-[solar--muted-bold] h-6 w-6  text-whites-40"></span>
              ) : null}
            </Button>

            <div className="flex w-[90px] text-whites-40">
              <Slider
                ref={volumeRef}
                value={volumestate}
                onChange={handleVolumeChange}
                color="#f2f2f2"
              />
            </div>
          </div>
          {/** timeline */}
          <Typography className="text-whites-40 font-[Roboto-Regular] hidden sm:flex md:text-base">
            {formatDuration(currentTime) ?? "0:00"} /{" "}
            {duration ? formatDuration(duration) : "0:00"}
          </Typography>
        </div>
      </div>

      {/** settings & resize */}
      <div className="flex flex-row gap-4 items-center">
        {/** settings menu */}
        {isMenuOpen && (
          <div
            id="multi-dropdown"
            className="absolute bottom-0 h-max right-4 -translate-y-16 z-50 flex flex-col gap-2 items-center"
          >
            {!isSubtitleMenuOpen && !isQualityMenuOpen && (
              <div className="flex flex-col w-[200px] gap-2 items-center p-3 rounded-lg bg-secondary-200 bg-opacity-90 ">
                {/** subtitle button */}
                {/* <Button
                  onClick={handleSubtitlesOpen}
                  className="text-whites-40 bg-secondary-900 flex w-full justify-between flex-row items-center gap-2 "
                >
                  <div className="flex flex-row items-center gap-2 ">
                    <span className="icon-[gg--captions] h-5 w-5  text-white"></span>
                    <Typography className="text-whites-40 !text-xs font-sans ">
                      Subtitles/CC
                    </Typography>
                  </div>

                  <div className="flex flex-row items-center gap-1 ">
                    <p className="text-white text-xs ">
                      {subtitle !== "Off" ? subtitle : "Off"}
                    </p>
                   
                    <span className="icon-[solar--arrow-right-bold] h-5 w-5  text-whites-40"></span>
                  </div>
                </Button> */}

                {/** quality button */}
                <Button
                  onClick={handleQualityOpen}
                  className="text-whites-40 bg-secondary-900 flex w-full justify-between flex-row items-center gap-2 "
                >
                  <div className="flex flex-row items-center gap-2 ">
                    <span className="icon-[mdi--mixer-settings-vertical] rotate-90 h-5 w-5  text-whites-40"></span>
                    <Typography className="text-white  !text-xs font-sans ">
                      Quality
                    </Typography>
                  </div>

                  <div className="flex flex-row items-center gap-1 ">
                    <p className="text-white text-xs ">
                      {videoSrc?.resolution}
                    </p>
                    {/** icon- arrow left */}
                    <span className="icon-[solar--arrow-right-bold] h-5 w-5  text-whites-40"></span>
                  </div>
                </Button>
              </div>
            )}

            {/** submenu for subtitles */}
            {/* {isSubtitleMenuOpen && (
              <div className="flex flex-col w-[200px] gap-2 items-center p-3 rounded-lg bg-secondary-200 bg-opacity-90 ">
               
                <Button
                  onClick={handleSubSettingsClose}
                  className="text-whites-40 bg-secondary-900 flex w-full  flex-row items-center gap-2 "
                >
                  <div className="flex flex-row items-center gap-1 ">
                   
                    <span className="icon-[solar--arrow-left-bold] h-5 w-5  text-white"></span>
                  </div>

                  <div className="flex flex-row items-center gap-2 ">
                    <Typography className="text-whites-40 !text-xs font-sans ">
                      Subtitles/CC
                    </Typography>
                  </div>
                </Button>

                <Divider className="w-full bg-white" />
      
                <div className="text-whites-40 font-[Inter-Regular] cursor-pointer flex w-full py-2 flex-row items-center gap-2 ">
                  <input
                    type="radio"
                    id="off"
                    name="subtitle"
                    value="off"
                    className="hidden"
                  />
                  <label
                    htmlFor="off"
                    className="text-whites-40 text-xs flex flex-row gap-2 items-center"
                  >
                    <div className="w-4 h-4">
                      {
                        <span className="icon-[material-symbols--check-rounded] h-4 w-4  text-white"></span>
                      }
                    </div>
                    <span>off</span>
                  </label>
                </div>

                {subtitles.map((item, index) => {
                  return (
                    <div className="text-white cursor-pointer flex w-full py-2 flex-row items-center gap-2 ">
                      <input
                        type="radio"
                        id={item.id}
                        name="subtitle"
                        value={item.id}
                        className="hidden"
                      />
                      <label
                        htmlFor={item.id}
                        className="text-white text-xs flex flex-row gap-2 items-center"
                      >
                        <div className="w-4 h-4">
                          {
                            <span className="icon-[material-symbols--check-rounded] h-4 w-4  text-white"></span>
                          }
                        </div>
                        <span>{item.name}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )} */}

            {/** quality menu */}
            {isQualityMenuOpen && (
              <div className="flex flex-col w-[200px] gap-2 items-center p-3 rounded-lg bg-secondary-200 bg-opacity-90  ">
                {/** back button */}
                <Button
                  onClick={handleSubSettingsClose}
                  className="text-whites-40 bg-secondary-800 flex w-full  flex-row items-center gap-2 "
                >
                  <div className="flex flex-row items-center gap-1 ">
                    {/** icon- arrow left */}
                    <span className="icon-[solar--arrow-left-bold] h-5 w-5  text-whites-40"></span>
                  </div>

                  <div className="flex flex-row items-center gap-2 ">
                    <Typography className="text-whites-40 !text-xs font-sans ">
                      Quality
                    </Typography>
                  </div>
                </Button>

                <Divider className="w-full bg-white" />
                {/** quality button */}
                {/* <div
                  onClick={() => handleResolution(item.id)}
                  className="text-white cursor-pointer flex w-full py-2 flex-row items-center gap-2 "
                >
                  <input
                    type="radio"
                    id="auto"
                    name="quality"
                    value="auto"
                    className="hidden"
                  />
                  <label
                    htmlFor="auto"
                    className="text-whites-40 text-xs flex flex-row gap-2 items-center"
                  >
                    <div className="w-4 h-4">
                      {
                        <span className="icon-[material-symbols--check-rounded] h-4 w-4  text-white"></span>
                      }
                    </div>

                    <span>auto</span>
                  </label>
                </div> */}

                {allVideos?.map((item, index) => {
                  return (
                    <div
                      onClick={() => handleResolutionChange(item)}
                      className={`text-whites-40 font-[Inter-Regular] cursor-pointer flex w-full py-2 flex-row items-center gap-2 ${
                        videoSrc?.resolution === item.resolution
                          ? "bg-secondary-900 "
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        id={item.id}
                        name="quality"
                        value={item.id}
                        className="hidden"
                      />
                      <label
                        htmlFor={item.id}
                        className="text-whites-40 text-xs flex flex-row gap-2 items-center"
                      >
                        <div className="w-4 h-4">
                          {videoSrc?.resolution === item.resolution ? (
                            <span className="icon-[material-symbols--check-rounded] h-4 w-4  text-whites-40"></span>
                          ) : null}
                        </div>
                        <span>{item.resolution}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Button
          id="basic-button"
          data-dropdown-toggle="multi-dropdown"
          onClick={handleSettingsClick}
          className="basic-button flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40 relative "
        >
          <div
            className={`flex flex-row items-center gap-1  delay-75 transition-all duration-75`}
          >
            <span
              className={`icon-[material-symbols-light--settings] ${
                isMenuOpen ? "-rotate-90" : "rotate-0"
              }  h-6 w-6  text-white`}
            ></span>
          </div>

          <div className="absolute -top-2 -right-2 w-max h-max flex flex-col justify-center items-center px-1 py-1 bg-opacity-90 bg-primary-500 rounded-full">
            <span className=" text-white text-[9px] font-[Inter-Bold] uppercase">
              {videoSrc?.resolution === "full_hd"
                ? "FHD"
                : videoSrc?.resolution === "ultra_hd"
                ? "UHD"
                : videoSrc?.resolution}
            </span>
          </div>
        </Button>

        {/** full screen */}

        {isFullScreen ? (
          <Button
            onClick={handleExitFullScreen}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--quit-full-screen-linear] h-6 w-6  text-whites-40"></span>
          </Button>
        ) : (
          <Button
            onClick={handleFullScreen}
            className="flex w-max h-max p-0 rounded-full bg-opacity-60 bg-transparent hover:bg-transparent hover:bg-opacity-40  "
          >
            <span className="icon-[solar--full-screen-linear] h-6 w-6  text-whites-40"></span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;
