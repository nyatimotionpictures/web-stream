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
import { useNavigate } from "react-router-dom";
import Button from "../../2-Components/Buttons/Button";
import Footer from "../../2-Components/Footer/Footer";
import { postSendOtp } from "../../5-Store/TanstackStore/services/api";
import logo from "../../1-Assets/logos/Logo.svg";

const ForgotPassword = () => {
  let navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);

  const initialValues = {
    contact: "",
    isEmail: true,
  };

  const validationSchema = yup.object().shape({
    contact: yup
      .string()
      .test("is-email-or-phone", "Invalid email or phone", (value) => {
        const phoneRegex = /^(\+|00)[1-9][0-9 \-\(\)\.]{7,32}$/;
        const isEmail = yup.string().email().isValidSync(value);
        const isPhone = phoneRegex.test(value);
        return isEmail || isPhone;
      })
      .required("Number or Email is required"),
    isEmail: yup.boolean().when("contact", {
      is: (contact) => contact && yup.string().email().isValidSync(contact),
      then: (schema) => schema.default(true),
      otherwise: (schema) => schema.default(false),
    }),
    //confirmPassword: yup.string().required("Confirm Password is required"),
  });

  const mutation = useMutation({
    mutationFn: postSendOtp,
    onSuccess: async (data, variables, context) => {
      let contact = variables?.isEmail
        ? variables.contact
        : variables.phoneNumber;
      setSnackbarMessage({ message: data.message, severity: "success" });
      navigate("/verifyforgotkey", {
        replace: true,
        state: { contact: contact, isEmail: variables?.isEmail, otpToken: data.otpToken },
      });
    },
    onError: (error) => {
      setSnackbarMessage(() => ({ message: error.message, severity: "error" }));
      //console.log("error", error);
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      values.contact = values?.contact?.toLowerCase();

      //modify the values
      const newValues = {
        ...values,
        role: "user",
        type: "forgotpassword",
        contact: values.isEmail ? values.contact : "",
      };

      //  console.log(values);
       mutation.mutate(newValues);

      //navigate("/login");
    },
  });

  React.useEffect(() => {
    if (formik.values.contact) {
      const isEmail = yup.string().email().isValidSync(formik.values.contact);
      formik.setFieldValue("isEmail", isEmail);
    } else {
      formik.setFieldValue("isEmail", false);
    }
  }, [formik.values.contact]);
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
                <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                  Enter your email below or{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-[#ED3F62] underline underline-offset-2 cursor-pointer font-[Inter-SemiBold]"
                  >
                    back to login
                  </span>
                </p>

                <p className="text-[#F2F2F2] text-[14px] text-center">
                  You will recieve the an OTP code to your email
                </p>
              </Stack>

              {/** inputs  */}
              <div className="flex flex-col gap-[10px]">
                {/** email or phone */}
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Email
                    </label>
                    <input
                      name="contact"
                      placeholder="Email"
                      value={formik.values.contact}
                      className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <ErrorMessage
                      errors={
                        formik.touched.contact && formik.errors.contact
                          ? true
                          : false
                      }
                      message={formik.errors.contact}
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

export default ForgotPassword;
const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
});

