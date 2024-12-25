import React from "react";
import Footer from "../../../2-Components/Footer/Footer";
import UDetailHero from "./UDetailHero";
import UFilmTabs from "./UFilmTabs";
import styled from "styled-components";
import { Stack, Typography } from "@mui/material";
import WebNavigation from "../../../2-Components/Navigation/WebNavigation";
import { useNavigate, useParams } from "react-router-dom";
import { useGetFilm } from "../../../5-Store/TanstackStore/services/queries";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import Button from "../../../2-Components/Buttons/Button";
import Logo from "../../../1-Assets/logos/Logo.svg";
import UVideoResolutionForm from "../../../2-Components/Forms/UVideoResolutionForm";
import FilmJson from "../../../1-Assets/data/film_metadata.json";

const UFilmDetailPage = () => {
  const [selectedFilm, setSelectedFilm] = React.useState(null);
  const [payModal, setPayModal] = React.useState(false);

  // const [isImgBroken, setIsImgBroken] = React.useState(false);

  // let params = new URLSearchParams(window.location.search);
  // const filmId = params.get("filmId");
  // console.log("filmId", filmId);
  let params = useParams();
  const formRef = React.useRef();
  // console.log("params", params);
  const filmsQuery = useGetFilm(params?.id);
  let navigate = useNavigate();

  //console.log("filmsQuery", filmsQuery?.data?.film);
  console.log(FilmJson[3])
  React.useEffect(() => {
    setSelectedFilm(() => FilmJson[3]);
  }, [FilmJson]);

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    } else {
      alert("No form")
    }
  }

  const handleAPISubmission = (values) => {
    console.log("values", values)
    //  alert(`form submitted ${editInfo.title}`);
   // createMutation.mutate(values)
    //handleFormSubmit()
    navigate("/payment", { state: {
      filmId: filmsQuery?.data?.film?.id,
      videoId: values.videoId,
      resolution: values.resolution,
      resolutionInfo: values.resolutionInfo,
    } });

  }
  const handlePaymentModel = () => {
    setPayModal(() => !payModal);
  };

  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
      <WebNavigation isLoggedIn={true} />

      <Stack className="flex-col w-full h-full space-y-0">
        <UDetailHero
          filmData={filmsQuery?.data?.film}
         // filmData={selectedFilm}
          handlePaymentModel={handlePaymentModel}
        />
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
                <div className="flex flex-col w-full h-full text-whites-40 gap-6 relative">
                  <CustomStack className="z-50 w-full justify-between items-center py-2 pt-7 sticky top-0 bg-secondary-900">
                    <div
                      className="mx-0 mt-0 select-none cursor-pointer w-10 h-10"
                      
                    >
                      <img src={Logo} alt="" className="w-full h-full" />
                    </div>

                    {/* <div className="flex gap-5">
                                              <Button  className="px-5 rounded-lg font-[Inter-Medium] bg-primary-700">
                                                  CANCEL & CLOSE
                                              </Button>
                                          </div> */}
                  </CustomStack>

                  {/** stepper show case */}

                  {/** form */}
                  <div className="block mb-3 h-full">
                    <UVideoResolutionForm
                      innerref={formRef}
                      handleStepNext={handleAPISubmission}
                      film={filmsQuery?.data?.film}
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
              </div>
            </div>
          </div>
        </CustomStack>
      )}
    </Container>
  );
};

export default UFilmDetailPage;

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;
