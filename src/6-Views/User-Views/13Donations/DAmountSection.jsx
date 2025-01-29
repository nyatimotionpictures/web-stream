import { Form, Formik } from "formik";
import React from "react";
import * as yup from "yup";
import {
  FormContainer,
  SingleWrapper,
} from "../../../2-Components/Stacks/InputFormStack";
import ErrorMessage from "../../../2-Components/Forms/ErrorMessage";
import PhoneInput from "react-phone-input-2";
import Mtnlogo from "../../../1-Assets/logos/MtnMomo.png";
import PesaPalLogo from "../../../1-Assets/logos/PesaPal.png";
import { Alert, Snackbar, Typography } from "@mui/material";
import "react-phone-input-2/lib/style.css";
import Button from "../../../2-Components/Buttons/Button";
import { useMutation } from "@tanstack/react-query";
import { makeGeneralDonation } from "../../../5-Store/TanstackStore/services/api";
import { useNavigate } from "react-router-dom";

const priceArray = [
  {
    key: "0",
    amount: 5000,
  },
  {
    key: "1",
    amount: 10000,
  },
  {
    key: "2",
    amount: 20000,
  },
  {
    key: "3",
    amount: 40000,
  },
  {
    key: "4",
    amount: 100000,
  },
  {
    key: "5",
    amount: 200000,
  },
];

const DAmountSection = () => {
  const [customAmount, setCustomAmount] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  let navigate = useNavigate();
  const handleCustomChange = (setFieldValue) => {
    setCustomAmount(() => true);
    setFieldValue("amount", null);
  };

  const handleChangeAmount = (amount, setFieldValue) => {
    setCustomAmount(() => false);
    // setSelectedAmount(() => amount);
    setFieldValue("amount", amount);
  };

  let initialValues = {
    amount: null,
    paymentType: "MTN",
    phonenumber: null,
    email: "",
    type: "streamWeb",
  };

  const validationSchema = yup.object().shape({
    amount: yup.number().required("amount is required"),
    phonenumber: yup
      .string()
      .min(10, "Insert Valid PhoneNumber")
      .max(15, "Dont start with zero. or  Please check your number")
      .required("phonenumber is required"),
    firstname: yup.string().required("firstname required"),
    lastname: yup.string().required("lastname required"),
    email: yup.string().required("email is required"),
    paymentType: yup.string().required("select payment method to continue"),
  });

  const handleDonateMutation = useMutation({
    mutationFn: makeGeneralDonation,
    onSuccess: (data, variables) => {
      console.log("data", data);
      //setRated(true)
      setSnackbarMessage({ message: data.message, severity: "success" });

      if (variables.paymentType === "MTN") {
        let path = `/`;

        localStorage.setItem("filmPath", path )
        navigate("/generaldonation/validate/" + data?.orderTrackingId, {
          state: {
            filmPath: path,
            option: variables.paymentType,
            orderTrackingId: data?.orderTrackingId,
          },
        });
      } else {
    
        let path = `/`;

        localStorage.setItem("filmPath", path )
        navigate("/process/pesapal", {
          state: {
            filmPath: path,
            redirectpath: data?.redirect_url,
            option: variables.paymentType === "MTN" ? "mtn" : "visa",
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
    <div className="min-h-[60vh] h-full lg:min-h-screen flex flex-col bg-[#17141B] items-center justify-center px-[30px] py-16 sm:px-16 md:py-16 lg:py-16 w-screen overflow-hidden relative">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          // mutation.mutate(values);
          let newValues = {
            ...values,
            amount: values.amount.toString(),
            request_origin:"web",
            payType: values.paymentType === "MTN" ? "mtn" : "pesapal",
          };
          handleDonateMutation.mutate(newValues);
          console.log("values", newValues);
        }}
      >
        {({ values, handleChange, errors, setFieldValue, setErrors, handleSubmit }) => (
          <Form>
            <div className="w-full h-full flex flex-col lg:flex-col mt-16 lg:mt-[100px] justify-between items-center gap-8 md:px-[5%] md:mt-[80px] py-0">
              {/** Amounts */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col items-start gap-4  sm:w-1/2">
                    <p className="font-[Inter-SemiBold] text-[#F2F2F2] text-opacity-70 text-center sm:text-left text-sm lg:text-sm">
                      Choose Amount:
                    </p>

                    <div className="flex flex-row flex-wrap gap-[5px] sm:gap-[10px]  items-center justify-evenly sm:justify-around">
                      {priceArray.map((data, index) => {
                        return (
                          <div
                            key={index}
                            className={`border-[#E5E7EB] border-[1px] rounded-[20px] flex items-center justify-center font-[Inter-Bold] text-xs  sm:text-[13.13px] lg:text-sm py-[7.5px] px-[13px] w-max cursor-pointer select-none  ${
                              data.amount === values.amount
                                ? "text-[#F2F2F2] bg-primary-500"
                                : "text-[#3C3A3B] bg-[#FBFBFB] hover:bg-primary-500 hover:text-[#F2F2F2]"
                            }`}
                            onClick={() =>
                              handleChangeAmount(data.amount, setFieldValue)
                            }
                          >
                            <p>
                              {data.amount
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </p>
                          </div>
                        );
                      })}

                      <div
                        className={`border-[#E5E7EB] border-[1px] rounded-[20px] flex items-center justify-center font-[Inter-Bold] text-xs sm:text-[13.13px] py-[7.5px] px-[13px] w-max cursor-pointer select-none  ${
                          customAmount
                            ? "text-[#F2F2F2] bg-primary-500"
                            : "text-[#3C3A3B] bg-[#FBFBFB] hover:bg-primary-500 hover:text-[#F2F2F2]"
                        }`}
                        onClick={() => handleCustomChange(setFieldValue)}
                      >
                        <p>others</p>
                      </div>
                    </div>
                  </div>

                  {/** custom amount */}
                  <div className="flex flex-col items-start sm:w-1/2">
                    {customAmount && (
                      <div className="flex flex-col w-full gap-4">
                        <p className="font-[Inter-SemiBold] text-[#F2F2F2] text-opacity-70 text-center sm:text-left text-sm lg:text-sm">
                          Enter Your Own:
                        </p>
                        <div className="flex flex-col gap-2">
                          <label className="text-[#F2F2F2] text-opacity-70 font-[Roboto-Medium] text-sm">
                            Other Amount:
                          </label>
                          <input
                            type="number"
                            name="amount"
                            value={values.amount}
                            onChange={handleChange}
                            className="border border-secondary-700 border-opacity-30 h-[30px]  sm:h-[40px] w-full rounded-lg focus:outline-none px-3 font-[Roboto-Regular] text-sm "
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <ErrorMessage
                  errors={errors && errors?.amount ? true : false}
                  message={errors?.amount}
                />
                {/* {errors && errors.amount ? (
                  <p className="font-[Inter-SemiBold] text-red-400 text-xs">
                    {errors.amount}
                  </p>
                ) : null} */}
              </div>

              {/**Donation Details */}
              <div className="flex flex-col gap-5 items-start w-full">
                <h1 className="font-[Inter-SemiBold] text-[#F2F2F2] text-opacity-70 text-left sm:text-left text-sm lg:text-sm">
                  Donation Details
                </h1>

                <div className="flex flex-col w-full gap-[10px]">
                  {/** Mobile Number */}
                  <SingleWrapper>
                    <FormContainer className="w-full">
                      <label className="text-[#bdb8b8] text-[12.56px]">
                        Mobile Number
                      </label>

                      {values.paymentType === "MTN" && (
                        <PhoneInput
                          defaultErrorMessage="Check number"
                          country={"ug"}
                          specialLabel="Number"
                          onlyCountries={
                            values.paymentType === "MTN" ? ["ug"] : []
                          }
                          countryCodeEditable={false}
                          value={values.phonenumber}
                          onChange={(phone, country) => {
                            //setFieldValue("phonenumber", phone)
                            if (
                              country.name === "Uganda" &&
                              phone.length > 12
                            ) {
                              setErrors({
                                ...errors,
                                phonenumber:
                                  "Dont start with zero.Please check your number",
                              });
                            } else {
                              setFieldValue("phonenumber", phone);
                            }
                          }}
                          inputProps={{
                            name: "phonenumber",
                            enableSearch: true,
                            countryCodeEditable: false,
                            placeholder: "i.e 787 *** ***",
                          }}
                          containerClass="phoneInputContainer"
                          inputClass="phoneInput !bg-[#FBFBFB] !bg-opacity-90"
                        />
                      )}

                      {values.paymentType === "Visa" && (
                        <PhoneInput
                          id="others"
                          defaultErrorMessage="Check number"
                          country={"ug"}
                          specialLabel="Number"
                          onlyCountries={[]}
                          countryCodeEditable={false}
                          value={values.phonenumber}
                          onChange={(phone, country) => {
                            //setFieldValue("phonenumber", phone)
                            if (
                              country.name === "Uganda" &&
                              phone.length > 12
                            ) {
                              setErrors({
                                ...errors,
                                phonenumber:
                                  "Dont start with zero.Please check your number",
                              });
                            } else {
                              setFieldValue("phonenumber", phone);
                            }
                          }}
                          inputProps={{
                            name: "phonenumber",
                            enableSearch: true,
                            countryCodeEditable: false,
                            placeholder: "i.e 787 *** ***",
                          }}
                          containerClass="phoneInputContainer"
                          inputClass="phoneInput !bg-[#FBFBFB] !bg-opacity-90"
                        />
                      )}

                      <ErrorMessage
                        errors={errors && errors?.phonenumber ? true : false}
                        message={errors?.phonenumber}
                      />
                    </FormContainer>
                  </SingleWrapper>
                  {/** First Name */}
                  <SingleWrapper>
                    <FormContainer className="w-full">
                      <label className="text-[#bdb8b8] text-[12.56px]">
                        First name
                      </label>

                      <input
                        type="text"
                        name="firstname"
                        value={values.firstname}
                        onChange={handleChange}
                        className="border border-secondary-700 border-opacity-30 h-[30px]  sm:h-[40px] w-full rounded-lg focus:outline-none px-3 font-[Roboto-Regular] bg-[#FBFBFB] text-sm "
                      />

                      <ErrorMessage
                        errors={errors && errors?.firstname ? true : false}
                        message={errors?.firstname}
                      />
                    </FormContainer>
                  </SingleWrapper>
                  {/** Last Name */}
                  <SingleWrapper>
                    <FormContainer className="w-full">
                      <label className="text-[#bdb8b8] text-[12.56px]">
                        Last name
                      </label>

                      <input
                        type="text"
                        name="lastname"
                        value={values.lastname}
                        onChange={handleChange}
                        className="border border-secondary-700 border-opacity-30 h-[30px] bg-[#FBFBFB] sm:h-[40px] w-full rounded-lg focus:outline-none px-3 font-[Roboto-Regular] text-sm "
                      />

                      <ErrorMessage
                        errors={errors && errors?.lastname ? true : false}
                        message={errors?.lastname}
                      />
                    </FormContainer>
                  </SingleWrapper>
                    {/** email */}
                    <SingleWrapper>
                    <FormContainer className="w-full">
                      <label className="text-[#bdb8b8] text-[12.56px]">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="border border-secondary-700 border-opacity-30 h-[30px] bg-[#FBFBFB] sm:h-[40px] w-full rounded-lg focus:outline-none px-3 font-[Roboto-Regular] text-sm "
                      />

                      <ErrorMessage
                        errors={errors && errors?.email ? true : false}
                        message={errors?.email}
                      />
                    </FormContainer>
                  </SingleWrapper>
                  {/** Write a Note */}
                  <SingleWrapper>
                    <FormContainer className="w-full">
                      <label className="text-[#bdb8b8] font-[Roboto-Medium] text-sm">
                        Write a note{" "}
                        <span className="text-[#bdb8b8] text-opacity-60">
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        type="text"
                        name="note"
                        value={values.note}
                        onChange={handleChange}
                        className="border border-secondary-700 border-opacity-30 h-[30px] bg-[#FBFBFB] sm:h-[40px] w-full rounded-lg focus:outline-none px-3 font-[Roboto-Regular] text-sm "
                      />
                    </FormContainer>
                  </SingleWrapper>
                </div>
              </div>

              {/** Choose Payment */}
              <div className="flex flex-col gap-4 w-full items-start py-6   select-none">
                <h1 className="font-[Inter-SemiBold] text-[#F2F2F2] text-opacity-70 text-left sm:text-left text-sm lg:text-sm">
                  Choose Payment
                </h1>

                <div className="flex flex-col gap-2 sm:flex-row ">
                  <label
                    className={` ${
                      values.paymentType === "MTN"
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
                      <Typography className="font-[Inter-Medium] text-whites-40 text-sm uppercase">
                        MTN MOMO
                      </Typography>
                    </div>

                    <input
                      checked={values.paymentType === "MTN"}
                      type="radio"
                      name="paymentType"
                      value="MTN"
                      className="hidden"
                      onChange={() => setFieldValue("paymentType", "MTN")}
                    />
                  </label>

                  <label
                    className={` ${
                      values.paymentType === "Visa"
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
                      <Typography className="font-[Inter-Medium] text-whites-40 text-sm uppercase">
                        Visa | Mastercard
                      </Typography>
                    </div>

                    <input
                      checked={values.paymentType === "Visa"}
                      type="radio"
                      name="paymentType"
                      value="Visa"
                      className="hidden"
                      onChange={() => setFieldValue("paymentType", "Visa")}
                    />
                  </label>
                </div>

                <ErrorMessage
                  message={errors?.paymentType && errors?.paymentType}
                  name="option"
                  errors={errors?.paymentType ? true : false}
                />
              </div>

              {/** Payment */}
              {
                handleDonateMutation?.isPending ? (
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
                      Donate
                    </Button>

                    {/* <Button
                      onClick={() => navigate(-1)}
                      type="button"
                      className="rounded-full py-2 px-4 text-[14.35px] w-full bg-transparent border border-primary-500 "
                      variant="default"
                    >
                      Cancel & Close
                    </Button> */}
                  </div>
                )
              }
              {/* <div>
                <Button
                  type="submit"
                  className="bg-[#EE5170] min-w-[190.34px] py-3 rounded-full
              font-[Inter-SemiBold] font-semibold text-16 leading-19.36 text-[#FFFAF6] cursor-pointer"
                >
                  Donate Now
                </Button>
              </div> */}
            </div>
          </Form>
        )}
      </Formik>

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

export default DAmountSection;
