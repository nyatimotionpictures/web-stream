
import React from 'react'
import styled from 'styled-components';
import FullCustomPlayer from './FullCustomPlayer';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGetFilm } from '../../../5-Store/TanstackStore/services/queries';
import CustomLoader from '../../../2-Components/Loader/CustomLoader';
import { Typography } from '@mui/material';
import Button from '../../../2-Components/Buttons/Button';
import { formatDuration, intervalToDuration, isBefore } from 'date-fns';
import RemainingFilmDays from './RemainingFilmDays';

const UWatchFilm = () => {
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState(null);
  const [episodeData, setEpisodeData] = React.useState(null);
  const [allVideos, setAllVideos] = React.useState([]);
  const [isCheckingAccess, setCheckingAccess] = React.useState(true);
  const [errorVideo, setErrorVideo] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [purchasedData, setPurchasedData] = React.useState(null);
  let params = useParams();
  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  let episodeId = searchParams.get("eid");
  let seasonId = searchParams.get("sid");
  // console.log(searchParams.toString())
  let navigate = useNavigate();
  const filmsQuery = useGetFilm(params?.id);


console.log("filmsQuery", filmsQuery);
  const handleCheckingVideo = () => {
    if (filmsQuery?.data?.film) {
      if(filmsQuery?.data?.film?.type?.includes("film")){
        if(filmsQuery?.data?.film?.access?.includes("free")){
          let videoArray = filmsQuery?.data?.film?.video?.filter(video => !video.isTrailer);
          console.log("videoArray", videoArray);
          //check if we have videos to watch
          //else set error message
          if (videoArray.length > 0){
            setAllVideos(videoArray);
  
            //check if we have HD videos
            let checkSelected = videoArray.filter(video => {
              if (video.resolution === "HD"){
                return video
              }
            })
  
            //if we have HD videos, set the first one as selected
            //else set the first one as selected
            if (checkSelected.length > 0){
              setSelectedVideoUrl(checkSelected[0]);
              setCheckingAccess(false);
    
            }else {
              setSelectedVideoUrl(videoArray[0])
              setCheckingAccess(false);
            }
  
          } else {
            setErrorVideo(true);
            setErrorMessage("No videos available");
            setCheckingAccess(false);
          }
        
        }
        else{
          
          let purchasedArray = filmsQuery?.data?.film?.purchase?.filter((data) => {
            if (data.valid){
              return data
            }
          })

          if(purchasedArray?.length > 0){
            setPurchasedData(purchasedArray);
            console.log("purchasedArray", purchasedArray);
            let resolutionsPurchased = purchasedArray[0].resolutions;
            console.log("resolutionsPurchased", resolutionsPurchased);
            let resolutionArray = filmsQuery?.data?.film?.video?.filter((data) => {
              if (resolutionsPurchased.includes(data.resolution) && !data.isTrailer){
                return data
              }
            })

            if (resolutionArray.length > 0){
              setAllVideos(resolutionArray);
              setCheckingAccess(false);
            }else {
              setErrorVideo(true);
              setErrorMessage("No videos available");
              setCheckingAccess(false);
            }
            //check if we have HD videos
            let checkSelected = resolutionArray.filter((data) => {
              if (data.resolution === "HD"){
                return data
              }
            })

            //if we have HD videos, set the first one as selected
            //else set the first one as selected
            if (checkSelected.length > 0){
              setSelectedVideoUrl(checkSelected[0]);
              setCheckingAccess(false);
    
            }else {
              setSelectedVideoUrl(videoArray[0])
              setCheckingAccess(false);
            }
            // setVideoUrl(filmsQuery?.data?.film?.url)
          }else {
            setErrorVideo(true);
            setErrorMessage("No access");
            setCheckingAccess(false);
          }
          //setVideoUrl(filmsQuery?.data?.film?.url)
        }
      }else {
        // console.log(episodeId, seasonId)

        setCheckingAccess(false);
        setErrorVideo(true);
        setErrorMessage("No videos available");
      }
     
    }
  };




  React.useEffect(() => {
    handleCheckingVideo();
  }, [filmsQuery?.data?.film]);
  // console.log(filmsQuery?.data?.film);

  //selecting different resolution
  const handleResolution = (resolution) => {
    setSelectedVideoUrl(resolution);
  }



  return (
    <Container className="w-screen h-full bg-secondary-900 overflow-hidden relative duration-300">
      <FullCustomPlayer purchasedData={purchasedData} filmData={filmsQuery?.data?.film?.type === "movie" || filmsQuery?.data?.film?.type?.includes("film") ? filmsQuery?.data?.film : episodeData}  videoSrc={selectedVideoUrl} allVideos={allVideos} handleResolution={handleResolution}  />

    
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
                          <span className='block'>
                          email:
                          streaming@nyatimotionpictures.com

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
                      onClick={() => filmsQuery?.data?.film?.type === "movie" || filmsQuery?.data?.film?.type?.includes("film") ? navigate(`/film/${params?.id}`, { replace: true }) : navigate(-1, { replace: true })}
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
  );
}

export default UWatchFilm

const Container = styled.div``