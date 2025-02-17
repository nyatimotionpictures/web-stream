import { useMutation } from "@tanstack/react-query";
import React from "react";
import heroImage from "../../1-Assets/Hero.png";
import { styled } from "@mui/system";
import * as yup from "yup";
import { useFormik } from "formik";
import { Alert, Box, Snackbar, Stack } from "@mui/material";
import {
  FormContainer,
  SingleWrapper,
} from "../../2-Components/Stacks/InputFormStack";
import ErrorMessage from "../../2-Components/Forms/ErrorMessage";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../2-Components/Buttons/Button";
import Footer from "../../2-Components/Footer/Footer";
import {
  postAuthReset,
} from "../../5-Store/TanstackStore/services/api";
import logo from "../../1-Assets/logos/Logo.svg";

const ResetKey = () => {
  let navigate = useNavigate();
  let location = useLocation();
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [viewNewPassword, setViewNewPassword] = React.useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = React.useState(false);

  const mutation = useMutation({
    mutationFn: postAuthReset,
    onSuccess: async (data, variables, context) => {
      setSnackbarMessage({ message: data.message, severity: "success" });
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
      //console.log("error", error);
    },
  });

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object().shape({
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);

      //modify the values
      const newValues = {
        newPassword: values.password,
        authToken: location?.state?.authToken,
      };

    //   console.log("newValues", newValues);
      //  console.log(values);
      mutation.mutate(newValues);

      //navigate("/login");
    },
  });

  return (
    <div className="min-h-screen !w-full flex flex-col gap-0 bg-secondary-700">
      <Container className="h-full !w-full py-20 min-h-screen flex flex-row gap-0 relative justify-center items-center">
        <form onSubmit={formik.handleSubmit}>
          <div className="w-screen px-6  sm:px-0 sm:max-w-[304px] md:max-w-[350px] sm:mx-auto h-full">
            {/** logo */}
            <Box className="absolute top-2 left-2  sm:top-[34px] sm:left-10">
              <Button variant={"ghost"}>
                <img src={logo} alt={"Nyati Films"} />
              </Button>
            </Box>

            {/** form */}
            <div className="mt-8 flex flex-col gap-[22px] ">
              {/** title */}
              <Stack>
                <h1 className="text-[#F2F2F2] text-[26px] text-center select-none font-[Inter-Bold]">
                  {" "}
                  Reset Password
                </h1>
                <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]"></p>
              </Stack>

              {/** inputs  */}
              <div className="flex flex-col gap-[10px]">
                {/** email or phone */}
                <SingleWrapper>
                  <FormContainer>
                    <label className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                      New Password (required)
                    </label>
                    <div className="flex flex-col gap-2 h-full relative justify-center text-whites-100">
                      <input
                        type={viewNewPassword ? "text" : "password"}
                        value={formik?.values.password}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        name="password"
                        id="password"
                      />

                      <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewNewPassword ? (
                          <span
                            onClick={() => setViewNewPassword(!viewNewPassword)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                            onClick={() => setViewNewPassword(!viewNewPassword)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                    </div>

                    <ErrorMessage
                      errors={
                        formik.touched.password && formik.errors.password
                          ? true
                          : false
                      }
                      message={formik.errors.password}
                    />
                  </FormContainer>
                </SingleWrapper>

                <SingleWrapper>
                  <FormContainer>
                    <label className="label font-[Inter-Regular] text-xs  text-whites-100 text-opacity-75">
                      Confirm Password (required)
                    </label>

                    <div className="flex flex-col gap-2 h-full relative justify-center text-whites-100">
                      <input
                        type={viewConfirmPassword ? "text" : "password"}
                        value={formik?.values.confirmPassword}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        name="confirmPassword"
                        id="confirmPassword"
                      />

                      <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewConfirmPassword ? (
                          <span
                            onClick={() =>
                              setViewConfirmPassword(!viewConfirmPassword)
                            }
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                            onClick={() =>
                              setViewConfirmPassword(!viewConfirmPassword)
                            }
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                    </div>

                    <ErrorMessage
                      errors={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? true
                          : false
                      }
                      message={formik.errors.confirmPassword}
                    />
                  </FormContainer>
                </SingleWrapper>

                {/** Button */}
                <div className="flex mt-4">
                  {mutation.isPending ? (
                    <Button
                      disabled
                      className="w-full min-w-[150px] px-4 rounded-full "
                    >
                      Submitting...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full  min-w-[150px] px-4 rounded-full"
                    >
                      Reset Password
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
      <Footer />

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

export default ResetKey;

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
});
