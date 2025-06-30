import React, { useContext } from "react";
import Footer from "../../2-Components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
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
import { postAuthLogin } from "../../5-Store/TanstackStore/services/api";
import { AuthContext } from "../../5-Store/AuthContext";

const Login = () => {
  let navigate = useNavigate();
  const [viewPassword, setViewPassword] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const {updateUser} = useContext(AuthContext)

  const initialValues = {
    contact: "",
    password: "",
    isEmail: false,
  };

  const validationSchema = yup.object().shape({
    contact: yup
      .string()
      .test("is-email-or-phone", "Invalid email", (value) => {
        const phoneRegex = /^(\+|00)[1-9][0-9 \-\(\)\.]{7,32}$/;
        const isEmail = yup.string().email().isValidSync(value);
        const isPhone = phoneRegex.test(value);
        return isEmail || isPhone;
      })
      .required("Email is required"),
    password: yup.string().required("Password is required"),
    isEmail: yup.boolean().when("contact", {
      is: (contact) => contact && yup.string().email().isValidSync(contact),
      then: (schema) => schema.default(true),
      otherwise: (schema) => schema.default(false),
    }),
    //confirmPassword: yup.string().required("Confirm Password is required"),
  });

  /** Mutation */
  const mutation = useMutation({
    mutationFn: postAuthLogin,
    onSuccess: (data) => {
      setSnackbarMessage({message: data.message, severity: "success"});
      updateUser(data)
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setSnackbarMessage(() => ({message: error.message, severity: "error"}));
    },
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      values.contact = values.contact.toLowerCase();

      //modify the values
      const newValues = {
        ...values,
        email: values.isEmail ? values.contact : "",
        phoneNumber: values.isEmail ? "" : values.contact,
      };
      
      delete newValues.fullname;
      delete newValues.contact;

     // console.log("newValues", newValues);
     // console.log(values);
      mutation.mutate(newValues);
      //navigate("/login");
    },
  });

  const handlePasswordView = (e) => {
    setViewPassword(() => !viewPassword);
  };

  React.useEffect(() => {
      if(formik.values.contact){
        const isEmail = yup.string().email().isValidSync(formik.values.contact);
        formik.setFieldValue("isEmail", isEmail);
      }else {
        formik.setFieldValue("isEmail", false);
      }
  }, [formik.values.contact]);

  //console.log("subdit", formik.isSubmitting)
  return (
    <div className="min-h-screen w-full flex flex-col gap-0 bg-secondary-700">
      <Container className="h-full w-full py-20 min-h-screen flex flex-row gap-0 relative justify-center items-center">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col w-screen px-8 sm:max-w-[400px]  md:px-0 md:max-w-[304px] md:mx-auto h-full">
            {/** logo */}
            <Box className="absolute top-2 left-2 md:top-[34px] md:left-10">
              <Button variant={"ghost"} >
                <img src={logo} alt={"Nyati Films"} />
              </Button>
            </Box>

            {/** form */}
            <Stack spacing="22px" className="mt-8">
              {/** title */}
              <Stack className="gap-2">
                <h1 className="text-[#F2F2F2] text-xl sm:text-[26px] text-center select-none font-[Inter-Bold]">
                  {" "}
                  Sign in to your account
                </h1>
                <p className="text-[#F2F2F2] text-sm sm:text-[14px] text-center select-none font-[Inter-Regular]">
                  Login below or{" "}
                  <span
                    onClick={() => navigate("/register")}
                    className="text-[#ED3F62] underline underline-offset-2 cursor-pointer font-[Inter-SemiBold]"
                  >
                    Create an account
                  </span>
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
                      errors={ formik.touched.contact && formik.errors.contact ? true : false}
                      message={formik.errors.contact}
                    />
                  </FormContainer>
                </SingleWrapper>
                
              
                {/** password */}
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Password
                    </label>
                    <div className="flex flex-col gap-2 h-full relative justify-center">
                      <input
                         type={viewPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="text-[#ffffff] font-[Inter-Medium] text-[14.35px]"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}

                      />

                      <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewPassword ? (
                          <span
                            onClick={handlePasswordView}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                            onClick={handlePasswordView}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                    </div>

                    <ErrorMessage
                      errors={formik.touched.password && formik.errors.password ? true : false}
                      message={formik.errors.password}
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
                     Sign In
                  </Button>
                )}
              </div>

              {/** forgot password */}
              <div className="flex mt-4 items-center justify-center">
                <span
                  onClick={()=> navigate("/forgotpassword")}
                 className="text-[#ED3F62] underline underline-offset-2 cursor-pointer font-[Inter-SemiBold]"
                >
                  Forgot Password?
                </span>   
                </div>
              </div>
            </Stack>
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
  )
}

export default Login

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
});