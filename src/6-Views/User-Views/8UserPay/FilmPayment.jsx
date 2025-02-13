import React, { useContext } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useGetFilm, useGetSeason } from "../../../5-Store/TanstackStore/services/queries";
import { Alert, Snackbar, Typography } from "@mui/material";
import Mtnlogo from "../../../1-Assets/logos/MtnMomo.png";
import AirtelLogo from "../../../1-Assets/logos/airtel.png";
import PesaPalLogo from "../../../1-Assets/logos/PesaPal.png";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FormContainer,
  SingleWrapper,
} from "../../../2-Components/Stacks/InputFormStack";
import Button from "../../../2-Components/Buttons/Button";
import { Form, Formik } from "formik";
import * as yup from "yup";
import ErrorMessage from "../../../2-Components/Forms/ErrorMessage";
import { useMutation } from "@tanstack/react-query";
import { makeFilmPurchase } from "../../../5-Store/TanstackStore/services/api";
import { AuthContext } from "../../../5-Store/AuthContext";


const FilmPayment = () => {
  let params = useSearchParams();
  let location = useLocation();
  const [selectedFilm, setSelectedFilm] = React.useState(null);
  const [currentUserData, setCurrentUserData] = React.useState(null);
  const [errorVideo, setErrorVideo] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [posterCover, setPosterCover] = React.useState([]);
 
  const userData = useContext(AuthContext);
  console.log("params", location);
  // let search = params?.state;
  // console.log("search", search);
  const filmsQuery = useGetFilm(location.state?.resourceId);
  const seasonsQuery = useGetSeason(location.state?.resourceId);
  let navigate = useNavigate();

  console.log("filmsQuery", filmsQuery?.data?.film);

  console.log("seasonsQuery", seasonsQuery?.data?.season);

  React.useEffect(() => {
    if (userData.currentUser !== null) {
      setCurrentUserData(userData.currentUser?.user);
    } else {
      navigate("/login", { replace: true });
    }
  }, [userData.currentUser?.user.id]);

  React.useEffect(() => {
    console.log("location.state?.resourceType", location.state?.resourceType)
    if (location.state?.resourceType === "film") {
      if (filmsQuery?.data?.film) {
     
        let filteredPosters = filmsQuery?.data?.film?.posters?.filter(
          (data) => {
            if (data.isCover) {
              return data;
            }
          }
        );
        setPosterCover(() => filteredPosters);
      }

    }else {
      if (seasonsQuery?.data?.season){
        let filteredPosters = seasonsQuery?.data?.season?.posters?.filter(
          (data) => {
            if (data.isCover) {
              return data;
            }
          }
        );
        setPosterCover(() => filteredPosters);
      }
    
    
    }
   
    
  }, [filmsQuery?.data?.film, seasonsQuery?.data?.season]);

  //userId
  //option
  //resourceId
  //paymentNumber
  //resolution
  //type
  const initialValues = {
    userId: currentUserData?.id,
    resourceId: location.state?.resourceId,
    resolution: location.state?.resolution?.toUpperCase(),
    resourceType: location.state?.resourceType,
    option: "",
    paymentNumber: "",
    // phoneCode: "",
    //  phoneNumber: "",
    type: "streamWeb",
  };

  const validationSchema = yup.object().shape({
    option: yup.string().required("required"),
    paymentNumber: yup.string().required("required"),
    // phoneCode: yup.string().required("required"),
    //    phoneNumber: yup.string().required("required"),
  });

  const handlePayMutation = useMutation({
    mutationFn: makeFilmPurchase,
    onSuccess: (data, variables) => {
      console.log("data", data);
      //setRated(true)
      setSnackbarMessage({ message: data.message, severity: "success" });

      if (variables.option === "mtnmomo") {
        // let path = filmsQuery?.data?.film?.type === "season" ? `/episode/${location?.state?.episodeId}/${filmsQuery?.data?.film?.id}/${location?.state?.seasonId}` : `/film/${filmsQuery?.data?.film?.id}`;

        let path = location.state?.resourceType === "film" ? `/film/${filmsQuery?.data?.film?.id}` : `/segments/${seasonsQuery?.data?.season?.id}`;
        localStorage.setItem("filmPath", path )
        navigate("/payment/validate/" + data?.orderTrackingId, {
          state: {
            filmPath: path,
            option: variables.option,
            orderTrackingId: data?.orderTrackingId,
          },
        });
      } else {
    
        // let path = filmsQuery?.data?.film?.type === "series" ? `/episode/${location?.state?.episodeId}/${filmsQuery?.data?.film?.id}/${location?.state?.seasonId}` : `/film/${filmsQuery?.data?.film?.id}`;


        let path = location.state?.resourceType === "film" ? `/film/${filmsQuery?.data?.film?.id}` : `/segments/${seasonsQuery?.data?.season?.id}`;

        localStorage.setItem("filmPath", path )
        navigate("/process/pesapal", {
          state: {
            filmPath: path,
            redirectpath: data?.redirect_url,
            option: variables.option,
            orderTrackingId: data?.orderTrackingId,
          },
        });
      }

      //navigate("/payment/validate/" + data?.orderTrackingId);
    },
    onError: (error) => {
      console.log("error", error);
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
    },
  });

  return (
    <div>
     
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={async (values, helpers) => {
            // mutation.mutate(values);
            let newValues = {
              ...values,
              paymentNumber: `+${values.paymentNumber}`,
              userId: currentUserData?.id,
            };
            handlePayMutation.mutate(newValues);
            //console.log("values", newValues);
          }}
        >
          {({
            values,
            handleChange,
            errors,
            handleSubmit,
            setFieldValue,
            setErrors,
            isSubmitting,
          }) => (
            <Form>
              <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative">
                <div className="flex flex-col  items-center text-whites-40 gap-4 px-4 md:px-0  md:min-w-[287px]">
                  <div className="flex flex-col items-center gap-4 w-full py-6 md:max-w-[500px]   h-full">
                    {/** Film Details */}

                    <div className="flex flex-row gap-4 items-center py-2 px-4 bg-[#36323E] md:w-full rounded-lg ">
                      <div>
                        <img
                          src={posterCover[0]?.url}
                          alt="poster"
                          className="w-[127.25px] h-[165px] rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h1 className="font-[Inter-Regular] text-base md:text-2xl text-whites-100 ">
                          Rent: { location.state?.resourceType === "film" ? filmsQuery?.data?.film?.title : seasonsQuery?.data?.season?.title}
                        </h1>
                        <p className="font-[Inter-Regular] text-sm md:text-base text-whites-100 ">
                          Duration: 72 hours (3 days)
                        </p>

                        <p className="font-[Inter-Regular] text-sm md:text-base text-whites-100 ">
                          {location.state?.resolutionInfo}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col w-full">
                      {/** Payment Methods */}
                      <div className="flex flex-col gap-4 items-center py-6 border-b-2 border-b-secondary-100 select-none">
                        <h1 className="w-full font-[Inter-SemiBold] text-base text-whites-100 ">
                          Select Payment Method
                        </h1>
                        <label
                          className={` ${
                            values.option === "mtnmomo"
                              ? "border-2 border-primary-500 bg-opacity-100"
                              : ""
                          } flex flex-row gap-2 items-center min-w-[300px] w-full bg-opacity-40 bg-secondary-400  py-2 px-2 rounded-lg justify-between`}
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <img
                              src={Mtnlogo}
                              alt=""
                              className="w-[89.29px] h-[50px] object-cover"
                            />
                            <Typography className="font-[Inter-Medium] text-sm uppercase">
                              MTN MOMO
                            </Typography>
                          </div>

                          <input
                            checked={values.option === "mtnmomo"}
                            type="radio"
                            name="option"
                            value="mtnmomo"
                            className="hidden"
                            onChange={() => setFieldValue("option", "mtnmomo")}
                          />
                        </label>

                        <label
                          className={`${
                            values.option === "airtelmoney"
                              ? "border-2 border-primary-500 bg-opacity-100"
                              : ""
                          } flex flex-row gap-2 items-center min-w-[300px] w-full bg-secondary-400 bg-opacity-40 py-2 px-2 rounded-lg justify-between`}
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <img
                              src={AirtelLogo}
                              alt=""
                              className="w-[89.29px] h-[50px] object-cover"
                            />
                            <Typography className="font-[Inter-Medium] text-sm uppercase">
                              Airtel Money
                            </Typography>
                          </div>

                          <input
                            checked={values.option === "airtelmoney"}
                            type="radio"
                            name="option"
                            value="airtelmoney"
                            className="hidden"
                            onChange={() =>
                              setFieldValue("option", "airtelmoney")
                            }
                          />
                        </label>
                        <label
                          className={` ${
                            values.option === "visa"
                              ? "border-2 border-primary-500 bg-opacity-100"
                              : ""
                          } flex flex-row gap-2 items-center min-w-[300px] w-full bg-secondary-400 py-2 px-2 bg-opacity-40 rounded-lg justify-between`}
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <img
                              src={PesaPalLogo}
                              alt=""
                              className="w-[89.29px] h-[50px] object-cover"
                            />
                            <Typography className="font-[Inter-Medium] text-sm uppercase">
                              Visa | Mastercard
                            </Typography>
                          </div>

                          <input
                            checked={values.option === "visa"}
                            type="radio"
                            name="option"
                            value="visa"
                            className="hidden"
                            onChange={() => setFieldValue("option", "visa")}
                          />
                        </label>

                        <ErrorMessage
                          message={errors?.option && errors?.option}
                          name="option"
                          errors={errors?.option ? true : false}
                        />
                      </div>

                      {/** Mobile Number */}
                      <div className="flex flex-col gap-4 items-center py-6 border-b-2 border-b-secondary-100 select-none w-full">
                        <h1 className="w-full font-[Inter-SemiBold] text-base text-whites-100 ">
                          Add Mobile Number
                        </h1>

                        <div className="flex w-full">
                          <FormContainer>
                            <label className="text-[#bdb8b8] text-[12.56px]">
                              Mobile Number
                            </label>

                            <PhoneInput
                              defaultErrorMessage="Check number"
                              country={"ug"}
                              specialLabel="Number"
                              className="!bg-[#36323e] text-secondary-100 w-[400px]"
                              countryCodeEditable={false}
                              value={`+${values.phoneCode} ${values.paymentNumber}`}
                              onChange={(phone, country) => {
                                //setFieldValue("phonenumber", phone)
                                if (
                                  country.name === "Uganda" &&
                                  phone.length > 12
                                ) {
                                  setErrors({
                                    ...errors,
                                    paymentNumber:
                                      "Dont start with zero.Please check your number",
                                  });
                                } else {
                                  //  console.log( phone)
                                  let slicedPhone = phone;
                                  // setFieldValue(
                                  //   "phoneCode",
                                  //   `+${country.dialCode}`
                                  // );
                                  // setFieldValue(
                                  //   "paymentNumber",
                                  //   slicedPhone.slice(country.dialCode.length)
                                  // );
                                  //  setFieldValue("paymentNumber", `+${country.dialCode}${slicedPhone.slice(country.dialCode.length)}`);
                                   setFieldValue("paymentNumber", phone);
                                }
                              }}
                              inputProps={{
                                name: "phonenumber",
                                enableSearch: true,
                                countryCodeEditable: false,
                                placeholder: "i.e 787 *** ***",
                              }}
                              containerClass="phoneInputContainer2"
                              inputClass="phoneInput2"
                            />

                            {errors && errors.phoneNumber && (
                              <Typography className="text-[red] font-[Segoe-UI] text-[13px]">
                                {errors.phoneNumber}
                              </Typography>
                            )}
                          </FormContainer>
                        </div>
                      </div>

                      {/** Submit Btn */}

                      {handlePayMutation.isPending ? (
                        <div className="w-full flex mt-4">
                          <Button
                            type="button"
                            className="rounded-full py-2 px-4 text-[14.35px] w-full "
                            variant="default"
                          >
                            Processing. Please wait ...
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col gap-5 mt-4">
                          <Button
                            onClick={handleSubmit}
                            type="button"
                            className="rounded-full py-2 px-4 text-[14.35px] w-full "
                            variant="default"
                          >
                            Continue
                          </Button>

                          <Button
                            onClick={() => navigate(-1)}
                            type="button"
                            className="rounded-full py-2 px-4 text-[14.35px] w-full bg-transparent border border-primary-500 "
                            variant="default"
                          >
                            Cancel & Close
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      

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
    </div>
  );
};

export default FilmPayment;
