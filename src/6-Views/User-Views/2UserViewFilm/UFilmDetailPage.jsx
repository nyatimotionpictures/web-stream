import React, { useContext } from "react";
import Footer from "../../../2-Components/Footer/Footer";
import UDetailHero from "./UDetailHero";
import UFilmTabs from "./UFilmTabs";
import styled from "styled-components";
import {
  Alert,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import WebNavigation from "../../../2-Components/Navigation/WebNavigation";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetFilm,
  useGetWatchList,
} from "../../../5-Store/TanstackStore/services/queries";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import Button from "../../../2-Components/Buttons/Button";
import Logo from "../../../1-Assets/logos/Logo.svg";
import UVideoResolutionForm from "../../../2-Components/Forms/UVideoResolutionForm";
import FilmJson from "../../../1-Assets/data/film_metadata.json";
import UMobileHero from "./UMobileHero";
import {
  postAddToWatchlist,
  rateLikesFilm,
  removeFromWatchlist,
} from "../../../5-Store/TanstackStore/services/api";
import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "../../../5-Store/AuthContext";
import CustomLoader from "../../../2-Components/Loader/CustomLoader";

const UFilmDetailPage = () => {
  const [selectedFilm, setSelectedFilm] = React.useState(null);
  const [payModal, setPayModal] = React.useState(false);
  const [currentUserData, setCurrentUserData] = React.useState(null);
  const [includedInWatchlist, setIncludedInWatchlist] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [allAvailableResolutions, setAllAvailableResolutions] = React.useState(
    []
  );
  const [errorVideo, setErrorVideo] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const userData = useContext(AuthContext);

  let params = useParams();
  const formRef = React.useRef();
  const filmsQuery = useGetFilm(params?.id);
  let navigate = useNavigate();

  React.useEffect(() => {
    if (userData.currentUser !== null) {
      setCurrentUserData(userData.currentUser?.user);
    } else {
      navigate("/login", { replace: true });
    }
    //console.log("userData", userData);
  }, [userData.currentUser?.user.id]);

  React.useEffect(() => {
    if (filmsQuery?.data?.film) {
      if (filmsQuery?.data?.film?.type?.toLowerCase()?.includes("film")) {
       
        if (filmsQuery?.data?.film?.pricing?.length > 0) {
          setAllAvailableResolutions(() => filmsQuery?.data?.film?.pricing[0]?.priceList);
          setErrorVideo(false);
          setErrorMessage(null);
        } else {
          setErrorVideo(true);
          setErrorMessage("No videos available");
        }
      }
    }
  }, [filmsQuery?.data?.film]);

  // console.log(FilmJson[3]);
  // React.useEffect(() => {
  //   setSelectedFilm(() => FilmJson[3]);
  // }, [FilmJson]);

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    } else {
      alert("No form");
    }
  };

  const handleAPISubmission = (values) => {
    console.log("values", values);
    //  alert(`form submitted ${editInfo.title}`);
    // createMutation.mutate(values)
    //handleFormSubmit()
    navigate("/payment", {
      state: {
        filmId: filmsQuery?.data?.film?.id,
        videoId: values.videoId,
        resolution: values.resolution,
        resolutionInfo: values.resolutionInfo,
      },
    });
  };
  const handlePaymentModel = () => {
    setPayModal(() => !payModal);
  };

  const isSmallScreen = useMediaQuery("(max-width:1023px)");

  /** rating mutation */
  const rateMutation = useMutation({
    mutationFn: rateLikesFilm,
    onSuccess: (data, variables) => {
      console.log("data", data);
      //setRated(true)
      setSnackbarMessage({ message: data.message, severity: "success" });
    },
    onError: (error) => {
      console.log("error", error);
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
    },
  });

  /** add watchlist mutation */
  const addToWatchlistMutation = useMutation({
    mutationFn: postAddToWatchlist,
    onSuccess: (data, variables) => {
      console.log("data", data);
      //setRated(true)
      setSnackbarMessage({ message: data.message, severity: "success" });
      watchlistQuery.refetch();
    },
    onError: (error) => {
      console.log("error", error);
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
    },
  });

  /** remove watchlist mutation */
  const removeFromWatchlistMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: (data, variables) => {
      console.log("data", data);
      //setRated(true)
      setSnackbarMessage({ message: data.message, severity: "success" });
      watchlistQuery.refetch();
    },
    onError: (error) => {
      console.log("error", error);
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
    },
  });

  /** get all user watchlist */
  const watchlistQuery = useGetWatchList(userData.currentUser?.user?.id);

  /** check watchlist */

  React.useEffect(() => {
    if (watchlistQuery?.data?.watchlist?.SAVED?.length > 0) {
      let watchlistArray = watchlistQuery?.data?.watchlist?.SAVED?.filter(
        (data) => data?.id === filmsQuery?.data?.film?.id
      );

      setIncludedInWatchlist(watchlistArray?.length > 0 ? true : false);
    } else {
      setIncludedInWatchlist(false);
    }
  }, [watchlistQuery?.data?.watchlist?.SAVED]);

  //handle Watch Video
  const handleWatchVideo = () => {
    navigate(`/watch/${filmsQuery?.data?.film?.id}`);
  };

  console.log(filmsQuery?.data?.film);

  if (filmsQuery?.isLoading) {
    return (
      <CustomStack className="flex-col w-full h-full bg-secondary-900 ">
        <CustomLoader text={"Loading..."} />
      </CustomStack>
    );
  }
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
      {!isSmallScreen && <WebNavigation blur={true} isLoggedIn={true} />}

      <Stack className="flex-col w-full h-full space-y-0">
        {isSmallScreen ? (
          <UMobileHero
            filmData={filmsQuery?.data?.film}
            // filmData={selectedFilm}
            handlePaymentModel={handlePaymentModel}
            currentUserData={currentUserData}
            rateMutation={rateMutation}
            addToWatchlistMutation={addToWatchlistMutation}
            removeFromWatchlistMutation={removeFromWatchlistMutation}
            includedInWatchlist={includedInWatchlist}
            handleWatchVideo={handleWatchVideo}
            videoPurchased={filmsQuery?.data?.film?.videoPurchased}
          />
        ) : (
          <UDetailHero
            filmData={filmsQuery?.data?.film}
            // filmData={selectedFilm}
            handlePaymentModel={handlePaymentModel}
            currentUserData={currentUserData}
            rateMutation={rateMutation}
            addToWatchlistMutation={addToWatchlistMutation}
            removeFromWatchlistMutation={removeFromWatchlistMutation}
            includedInWatchlist={includedInWatchlist}
            handleWatchVideo={handleWatchVideo}
            videoPurchased={filmsQuery?.data?.film?.videoPurchased}
          />
        )}

        <div className="px-2 lg:px-16">
          <UFilmTabs
            filmData={filmsQuery?.data?.film}
            // filmData={selectedFilm}
          />
        </div>
      </Stack>
      <Footer />

      {/** Popup */}
      {payModal && (
        <CustomStack
          className="relative z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="false"
        >
          <div className="fixed inset-0 border rounded-xl bg-secondary-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-50 bg-primary-200 bg-opacity-10 overflow-hidden">
            <div className="relative transform overflow-y-auto rounded-lg  bg-opacity-20 flex items-center justify-center h-screen text-left shadow-xl transition-all">
              <div className="bg-secondary-900 px-5 md:px-16 pt-0 w-full max-w-[700px] rounded-lg h-screen md:h-max">
                {/**  forms  */}
                {allAvailableResolutions?.length > 0 ? (
                  <div className="flex flex-col w-full h-full text-whites-40 gap-6 relative">
                    <CustomStack className="z-50 w-full justify-between items-center py-2 pt-7 sticky top-0 bg-secondary-900">
                      <div className="mx-0 mt-0 select-none cursor-pointer w-10 h-10">
                        <img src={Logo} alt="" className="w-full h-full" />
                      </div>
                    </CustomStack>

                    {/** form */}
                    <div className="block mb-3 h-full">
                      <UVideoResolutionForm
                        innerref={formRef}
                        handleStepNext={handleAPISubmission}
                        film={filmsQuery?.data?.film}
                        pricingData={filmsQuery?.data?.film?.pricing[0]}
                        allAvailableResolutions={allAvailableResolutions}
                      />
                    </div>

                    {/** stepper control */}
                    <div className="border-t-2 border-t-secondary-500 relative">
                      <div className="container flex flex-col-reverse md:flex-row gap-4 md:gap-2 items-center justify-end mx-0  mt-4 mb-8 ">
                        <Button
                          onClick={handlePaymentModel}
                          className="w-max bg-transparent border border-primary-500 min-w-full md:min-w-[150px] px-5 rounded-lg text-sm"
                        >
                          Cancel & Close
                        </Button>
                        <Button
                          onClick={handleFormSubmit}
                          className="w-max min-w-full md:min-w-[150px] px-5 rounded-lg text-sm"
                        >
                          Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full h-full text-whites-40 gap-6 relative">
                    <CustomStack className="z-50 w-full justify-between items-center py-2 pt-7 sticky top-0 bg-secondary-900">
                      <div className="mx-0 mt-0 select-none cursor-pointer w-10 h-10">
                        <img src={Logo} alt="" className="w-full h-full" />
                      </div>
                    </CustomStack>

                    {/** form */}
                    <div className="block mb-3 h-full">
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
                              <p className="mt-4 text-sm text-whites-40">
                                You have accessibility to this film. Please Pay
                                for film or contact support for more
                                information.
                              </p>

                              <p className="mt-4 text-sm text-whites-40">
                                email: streaming@nyatimotionpictures.com
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/** stepper control */}
                    <div className="border-t-2 border-t-secondary-500 relative">
                      <div className="container flex flex-col-reverse md:flex-row gap-4 md:gap-2 items-center justify-end mx-0  mt-4 mb-8 ">
                        <Button
                          onClick={handlePaymentModel}
                          className="w-max bg-transparent border border-primary-500 min-w-full md:min-w-[150px] px-5 rounded-lg text-sm"
                        >
                          Cancel & Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CustomStack>
      )}

      {/** snackbar */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarMessage?.severity} variant="filled">
          {snackbarMessage?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UFilmDetailPage;

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;
