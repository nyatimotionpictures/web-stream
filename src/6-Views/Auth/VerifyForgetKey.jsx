import React from "react";
import Footer from "../../2-Components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { setIn, useFormik } from "formik";
import heroImage from "../../1-Assets/Hero.png";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import Button from "../../2-Components/Buttons/Button";
import logo from "../../1-Assets/logos/Logo.svg";
import {
  FormContainer,
  SingleWrapper,
} from "../../2-Components/Stacks/InputFormStack";
import ErrorMessage from "../../2-Components/Forms/ErrorMessage";
import { useMutation } from "@tanstack/react-query";
import {
  postSendOtp,
  verifyOtp,
} from "../../5-Store/TanstackStore/services/api";

const VerifyForgetKey = () => {
  let navigate = useNavigate();
  let location = useLocation();

  const otp0 = React.useRef(null);
  const otp1 = React.useRef(null);
  const otp2 = React.useRef(null);
  const otp3 = React.useRef(null);

  const [otpnum, setOtpnum] = React.useState(["", "", "", ""]);
  const [resendBtn, setResendBtn] = React.useState(false);
  const [resendCount, setResendCount] = React.useState(56);
  const [restartInterval, setRestartInterval] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);

  const sendMutation = useMutation({
    mutationFn: postSendOtp,
    onSuccess: (data) => {
      // console.log("data", data);
      setSnackbarMessage({ message: data.message, severity: "success" });
      navigate("/verifyforgotkey", {
        replace: true,
        state: { contact: location?.state?.contact, isEmail: location?.state?.isEmail, otpToken: data.otpToken },
      });
    },
    onError: (error) => {
      setSnackbarMessage({ message: error?.message, severity: "error" });
    },
  });


    const verifyMutation = useMutation({
      mutationFn: verifyOtp,
      onSuccess: (data) => {
        setSnackbarMessage({ message: data.message, severity: "success" });
        navigate("/resetkey", {
          replace: true,
          state: {
            contact: location.state.contact,
            isEmail: location.state.isEmail,
            authToken: data?.authToken,
          },
        });
      },
      onError: (error) => {
        setSnackbarMessage({ message: error?.message, severity: "error" });
      },
    });

  React.useEffect(() => {
    let newInterval = setInterval(() => {
      setResendCount((prev) => {
        if (prev <= 1) {
          clearInterval(newInterval);
          setResendBtn(() => true);
          return 0;
        }
        return prev - 1;
      });
      //console.log("resendCount", resendCount);
    }, 1000);

    return () => {
      clearInterval(newInterval);
    };
  }, [restartInterval]);

  /** handle otp input */
  const handleInputOtp = (position, value) => {
    let otpArray = [...otpnum];
    otpArray[position] = value;
    setOtpnum(() => otpArray);
    //position 0
    if (position === 0 && otpArray[position] !== "" && value !== "") {
      otp1.current?.focus();
    } else if (position === 0 && value === "") {
      otp0.current?.focus();
    }

    //position 1
    if (position === 1 && otpArray[position] !== "" && value !== "") {
      otp2.current?.focus();
    } else if (position === 1 && value === "") {
      otp0.current?.focus();
    }

    //position 2
    if (position === 2 && otpArray[position] !== "" && value !== "") {
      otp3.current?.focus();
    } else if (position === 2 && value === "") {
      otp1.current?.focus();
    }

    //position 3
    if (position === 3 && value === "") {
      otp2.current?.focus();
    }
  };

  /** hamdle otp submit */
  const handleSubmitOtp = () => {
    // console.log("otpnum", otpnum.join(""));
    let contact = location?.state?.contact;
    let isEmail = location?.state?.isEmail; 
    verifyMutation.mutate({
      contact,
      isEmail,
      type: "forgotpassword",
      otp: otpnum?.join(""),
      otpToken: location.state.otpToken,
    });
    // setIsSubmittingResend(() => true);
  };

  /** handle otp resend */
  const handleResendOtp = () => {
    // console.log("resend otp");
    sendMutation.mutate({
      contact: location?.state?.contact,
      type: "forgotpassword",
      isEmail: location?.state?.isEmail,
    });
    setResendCount(() => 56);
    setResendBtn(() => false);
    setRestartInterval(() => !restartInterval);
    setOtpnum(() => ["", "", "", ""]);
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-0 bg-secondary-700">
      <Container className="h-full w-full py-20 min-h-screen flex flex-row gap-0 relative justify-center items-center">
        <Stack className="max-w-[304px] mx-auto h-full">
          {/** logo */}
          <Box className="absolute top-2 left-2 md:top-[34px] md:left-10">
            <Button variant={"ghost"}>
              <img src={logo} alt={"Nyati Films"} />
            </Button>
          </Box>

          {/** form */}
          <Stack spacing="22px" className="mt-8">
            {/** title */}
            <Stack>
              <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                Code has been sent to <span>{location?.state?.contact}</span>
              </p>
            </Stack>

            {/** inputs  */}
            <div className="flex flex-col gap-[10px] items-center ">
              <SingleWrapper>
                <FormContainer>
                  <Stack
                    w="100%"
                    direction="row"
                    spacing={"16px"}
                    className="h-[65px] justify-between items-center padding-0"
                  >
                    {[...Array(4)].map((data, index) => {
                      let otpRef;

                      if (index === 0) {
                        otpRef = otp0;
                      }
                      if (index === 1) {
                        otpRef = otp1;
                      }
                      if (index === 2) {
                        otpRef = otp2;
                      }
                      if (index === 3) {
                        otpRef = otp3;
                      }

                      return (
                        <input
                          key={index}
                          ref={otpRef}
                          autoFocus={index === 0 ? true : false}
                          maxLength={1}
                          value={otpnum[index]}
                          onChange={(e) => {
                            e.preventDefault();
                            handleInputOtp(index, e.target.value);
                          }}
                          className="w-[65px] h-full text-[#ffffff] text-[20px] text-center font-[Inter-Medium] !indent-0"
                        />
                      );
                    })}
                  </Stack>
                </FormContainer>
              </SingleWrapper>

              {/** Resend Btn */}
              <SingleWrapper>
                {resendBtn ? (
                  <div>
                    <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                      Resend code:{" "}
                      {sendMutation.isPending ? (
                        <span className="text-[#ED3F62] underline underline-offset-2 cursor-pointer">
                          sending...
                        </span>
                      ) : (
                        <span
                          onClick={() => handleResendOtp()}
                          className="text-[#ED3F62] underline underline-offset-2 cursor-pointer"
                        >
                          send another code
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                    Resend code in{" "}
                    <span className="text-[#ED3F62] underline underline-offset-2 cursor-pointer">
                      {resendCount}
                    </span>{" "}
                    s
                  </p>
                )}
              </SingleWrapper>

              {/** Submit Btn */}
              <div className="flex mt-4">
                {verifyMutation.isPending ? (
                  <Button
                    disabled
                    className="w-full min-w-[150px] px-4 rounded-full "
                  >
                    Submitting...
                  </Button>
                ) : (
                  <Button
                    onClick={otpnum?.includes("") ? null : handleSubmitOtp}
                    className={`block w-full rounded-full border border-[#EE5170] bg-primary-400 px-12 py-3 text-sm font-medium text-whites-40 text-[14.35px] hover:bg-primary-500 hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto lg:px-16 font-[Inter-SemiBold] ${
                      otpnum?.includes("")
                        ? " text-opacity-50 border-secondary-300 bg-secondary-300 !bg-opacity-50 !cursor-not-allowed hover:bg-secondary-300"
                        : ""
                    }`}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </Stack>
        </Stack>
      </Container>
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

      <Footer />
    </div>
  );
};

export default VerifyForgetKey;

const Container = styled(Box)({
  background: `linear-gradient(
          to top,
          rgba(20, 17, 24, 1),
          rgba(20, 17, 24, 0.729)
        ),
        url(${heroImage}) left/cover no-repeat`,
});
