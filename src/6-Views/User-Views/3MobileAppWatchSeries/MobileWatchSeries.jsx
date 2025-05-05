import React from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useGetSeasonMobile } from "../../../5-Store/TanstackStore/services/queries";
import Button from "../../../2-Components/Buttons/Button";
import CustomLoader from "../../../2-Components/Loader/CustomLoader";
import styled from "styled-components";
import { Typography } from "@mui/material";
import MSeriesFullCustomPlayer from "./MSeriesFullCustomPlayer";
import qs from "query-string";

const MobileWatchSeries = () => {
    const [selectedVideoUrl, setSelectedVideoUrl] = React.useState(null);
  const [episodeData, setEpisodeData] = React.useState(null);
  const [episodeIndex, setEpisodeIndex] = React.useState(0);
  const [allEpisodes, setAllEpisodes] = React.useState([]);
  const [allVideos, setAllVideos] = React.useState([]);
  const [isCheckingAccess, setCheckingAccess] = React.useState(true);
  const [purchasedData, setPurchasedData] = React.useState(null);
  let [searchParams, setSearchParams] = useSearchParams();
    const search = qs.parse(searchParams.toString());

  const [errorVideo, setErrorVideo] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  let params = useParams();
  let location = useLocation();

  let episodeId = searchParams.get("ep");
  let navigate = useNavigate();
  React.useEffect(() => {
    if (!search?.token) {
      // window.ReactNativeWebView.postMessage("invalidToken");
    }
    localStorage.setItem("Mb_token", search?.token);
  }, [search?.token]);

  const { data, isPending, isError, error } = useGetSeasonMobile(params?.id);


 

  // console.log(data?.season);

  const handleCheckingVideo = () => {
    if (data?.season && !isPending) {
      //free
      if (data?.season?.access?.includes("free")) {
        let sortedEpisodes = data?.season?.episodes.sort((a, b) => {
          return a.episode - b.episode;
        });
        // console.log("sortedEpisodes", sortedEpisodes);

        let allEpisodeData = sortedEpisodes.filter(
          (data) => data?.visibility === "published"
        );
        // console.log("sortedEpisodes", allEpisodeData);
        setAllEpisodes(allEpisodeData);
        //look for episode
        if (episodeId) {
          // console.log("here", episodeId)
          let episodeDataDetail = allEpisodeData.find((episode) => {
            if (episode.id === episodeId) {
              return episode;
            }
          });
          setEpisodeIndex(allEpisodeData.indexOf(episodeDataDetail));
          console.log("wp", episodeDataDetail);
          if (episodeDataDetail && episodeDataDetail?.video?.length > 0) {
            setAllVideos(episodeDataDetail.video);
            setEpisodeData(episodeDataDetail);
            //check if we have HD videos

            let checkSelected = episodeDataDetail.video.filter((video) => {
              if (video.resolution === "HD") {
                return video;
              }
            });

            console.log("checkSelected", checkSelected);

            if (checkSelected.length > 0) {
              setSelectedVideoUrl(checkSelected[0]);
              setCheckingAccess(false);
            } else {
              setSelectedVideoUrl(episodeDataDetail.video[0]);
              setCheckingAccess(false);
            }

            console.log(episodeDataDetail);
            // setSelectedVideoUrl(episodeData.videoUrl);
          } else {
            console.log("here");
            setErrorVideo(true);
            setErrorMessage("Episode not found or Videos not Found");
            setCheckingAccess(false);
          }
        } else {
          navigate(
            `/watch/s/${params?.id}?ep=${data?.season?.episodes[0]?.id}`,
            { replace: true }
          );
        }
      } else {
        // console.log("data?.season?.purchase", data?.season?.purchase);
        let purchasedArray = data?.season?.purchase?.filter((data) => {
          if (data.valid) {
            return data;
          }
        });

        // console.log("purchasedArray", purchasedArray);

        if (purchasedArray?.length > 0) {
          setPurchasedData(purchasedArray);
          let resolutionsPurchased = purchasedArray[0].resolutions;
          let sortedEpisodes = data?.season?.episodes.sort((a, b) => {
            return a.episode - b.episode;
          });

          // console.log("sortedEpisodes", resolutionsPurchased);

          let allEpisodeData = sortedEpisodes.filter(
            (epdata) => epdata?.visibility === "published"
          );

          let resolutionDataArray = allEpisodeData?.map((allepdata) => {
            return {
              ...allepdata,
              video: allepdata?.video?.filter((video) => {
                if (
                  resolutionsPurchased.includes(video.resolution) &&
                  !video.isTrailer
                ) {
                  return video;
                }
              }),
            };
          });

          // console.log("resolutionDataArray", resolutionDataArray);

          //check the existence of the selected Id
          if (resolutionDataArray.length > 0) {
            setAllEpisodes(resolutionDataArray);
            if (episodeId) {
              let episodeDataDetail = resolutionDataArray.find((episode) => {
                if (episode.id === episodeId) {
                  return episode;
                }
              });
              if (episodeDataDetail && episodeDataDetail?.video?.length > 0) {
                setAllVideos(episodeDataDetail.video);
                setEpisodeIndex(resolutionDataArray.indexOf(episodeDataDetail));
                setEpisodeData(resolutionDataArray[0]);
                let checkSelected = episodeDataDetail.video.filter((video) => {
                  if (video.resolution === "HD") {
                    return video;
                  }
                });

                if (checkSelected.length > 0) {
                  setSelectedVideoUrl(checkSelected[0]);
                  setCheckingAccess(false);
                } else {
                  setSelectedVideoUrl(episodeDataDetail.video[0]);
                  setCheckingAccess(false);
                }
              } else {
                // console.log("here");
                setErrorVideo(true);
                setErrorMessage("Episode not found or Videos not Found");
                setCheckingAccess(false);
              }
            } else {
              navigate(
                `/watch/s/${params?.id}?ep=${resolutionDataArray[0]?.id}`,
                { replace: true }
              );
            }
          } else {
            setErrorVideo(true);
            setErrorMessage("Episode not found or Videos not Found");
            setCheckingAccess(false);
          }
        }
      }
    }
  };

  const handleEpisodeChange = (episodeId) => {
    navigate(`/watch/s/${params?.id}?ep=${episodeId}`);
  };

  const handleNextEpisode = (index) => {
    let episode = allEpisodes[index];
    setEpisodeIndex(index);
    setEpisodeData(episode);
    handleEpisodeChange(episode?.id);
    // setSelectedVideoUrl(episode?.video[0]);
    // setSelectedVideoUrl(data?.season?.episodes[index]?.video[0]);
  };

  React.useEffect(() => {
    handleCheckingVideo();
  }, [data?.season, episodeId]);

  //selecting different resolution
  const handleResolution = (resolution) => {
    setSelectedVideoUrl(resolution);
  };

  if (isError) {
    if(error?.message === "Session expired. Please login again."){
      // window.ReactNativeWebView.postMessage("invalidToken");
      return (
        <Container className="w-screen h-screen bg-secondary-900 overflow-hidden relative duration-300">
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-secondary-900 bg-opacity-70">
            <div className="w-full h-full flex flex-col justify-center items-center ">
              <CustomLoader text="Session expired. Please login again." />
            </div>
          </div>
        </Container>
      );
    }
    return (
      <Container className="w-screen h-screen bg-secondary-900 overflow-hidden relative duration-300">
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-secondary-900 bg-opacity-70">
          <div className="w-full h-full flex flex-col justify-center items-center ">
            <CustomLoader text="error loading film, please try again" />
          </div>
        </div>
      </Container>
    );
  }
  return (
    <Container className="w-screen h-screen bg-secondary-900 overflow-hidden relative duration-300">
      <MSeriesFullCustomPlayer
        purchasedData={purchasedData}
        filmData={episodeData}
        allVideos={allVideos}
        videoSrc={selectedVideoUrl}
        handleResolution={handleResolution}
        handleNextEpisode={handleNextEpisode}
        episodeIndex={episodeIndex}
        allEpisodes={allEpisodes}
      />
      {isCheckingAccess && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-secondary-900 bg-opacity-70">
          <div className="w-full h-full flex flex-col justify-center items-center ">
            <CustomLoader text="checking access, please wait..." />
          </div>
        </div>
      )}

      {errorVideo && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-secondary-900 bg-opacity-70">
          <div className="w-full h-full flex flex-col justify-center items-center ">
            <div className="fixed inset-0 border rounded-xl bg-secondary-500 bg-opacity-75 transition-opacity"></div>

            <div className="relative transform overflow-y-auto rounded-lg  bg-opacity-20 flex items-center justify-center h-max  text-left shadow-xl transition-all">
              <div className="bg-secondary-900 min-w-[290px] flex flex-col items-center justify-center gap-5 py-5 px-5 md:px-16 pt-2 w-full max-w-[700px] rounded-lg  h-max">
                <div className="flex flex-col gap-5 items-center justify-center">
                  <Typography className="text-center text-lg font-[Inter-Medium] text-whites-40 text-opacity-100">
                    Error Video Availabilty
                  </Typography>
                  {errorMessage !== null &&
                    errorMessage.includes("No videos available") && (
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <p className="mt-4 text-sm text-whites-40">
                          No videos available for this film.
                        </p>

                        <p className="mt-4 text-sm text-whites-40">
                          Please contact support for more information.
                          <span className="block">
                            email: streaming@nyatimotionpictures.com
                          </span>
                        </p>
                      </div>
                    )}

                  {errorMessage !== null &&
                    errorMessage.includes("No access") && (
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <p className="mt-4 text-sm text-whites-40 max-w-[300px]">
                          You have no accessibility to this film. Please Pay for
                          film or contact support for more information.
                        </p>

                        <p className="mt-4 text-sm text-whites-40">
                          email: streaming@nyatimotionpictures.com
                        </p>
                      </div>
                    )}

                  <div className="flex flex-col gap-2 items-center justify-center">
                    <Button
                      onClick={() => navigate(-1, { replace: true })}
                      className="w-full bg-transparent border border-primary-500 min-w-full md:min-w-[150px] px-5 rounded-lg text-sm"
                    >
                      Back to Film{" "}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export default MobileWatchSeries

const Container = styled.div``;