import React from "react";
import Footer from "../../2-Components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
import heroImage from "../../1-Assets/Hero.png";
import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { styled } from "@mui/system";
import Button from "../../2-Components/Buttons/Button";
import logo from "../../1-Assets/logos/Logo.svg";
import {
  FormContainer,
  SingleWrapper,
} from "../../2-Components/Stacks/InputFormStack";
import ErrorMessage from "../../2-Components/Forms/ErrorMessage";
import { useMutation } from "@tanstack/react-query";
import { postUserRegister } from "../../5-Store/TanstackStore/services/api";

const Register = () => {
  let navigate = useNavigate();
  const [viewPassword, setViewPassword] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);

  const mutation = useMutation({
    mutationFn: postUserRegister,
    onSuccess: async (data, variables, context) => {
     
      let contact = variables?.isEmail ? variables.email : variables.phoneNumber;
      setSnackbarMessage({message: data.message, severity: "success"});
      navigate("/verifyaccount", { replace: true, state:{contact:contact, isEmail: variables?.isEmail  } });
    },
    onError: (error) => {
      setSnackbarMessage(() => ({message: error.message, severity: "error"}));
      //console.log("error", error);
    },
  })

  const initialValues = {
    contact: "",
    fullname: "",
    username: "",
    password: "",
    isEmail: false,
  //  confirmPassword: "",
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
    fullname: yup.string().required("Your fullname is required"),
    username: yup.string().required("Please enter a username"),
    password: yup.string().required("Password is required"),
    isEmail: yup.boolean().when("contact", {
      is: (contact) => contact && yup.string().email().isValidSync(contact),
      then: (schema) => schema.default(true),
      otherwise: (schema) => schema.default(false),
    }),
    //confirmPassword: yup.string().required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      values.contact = values.contact.toLowerCase();
      values.username = values.username.toLowerCase();

      //modify the values
      const newValues = {
        ...values,
        firstName: values.fullname.split(" ")[0],
        lastName: values.fullname.split(" ")[1],
        role: "user",
        email: values.isEmail ? values.contact : "",
        phoneNumber: values.isEmail ? "" : values.contact,
      };
      
      delete newValues.fullname;
      delete newValues.contact;

     // console.log("newValues", newValues);
    //  console.log(values);
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
            <div  className="mt-8 flex flex-col gap-[22px] ">
              {/** title */}
              <Stack>
                <h1 className="text-[#F2F2F2] text-[26px] text-center select-none font-[Inter-Bold]">
                  {" "}
                  Create account
                </h1>
                <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                  Enter your account details below or{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-[#ED3F62] underline underline-offset-2 cursor-pointer font-[Inter-SemiBold]"
                  >
                    Sign in
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
                      placeholder="Email or Phone"
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
                {/** fullname */}
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Fullname
                    </label>
                    <input
                      name="fullname"
                      placeholder="Firstname Lastname"
                      value={formik.values.fullname}
                      className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <ErrorMessage
                      errors={formik.touched.fullname && formik.errors.fullname ? true : false}
                      message={formik.errors.fullname}
                    />
                  </FormContainer>
                </SingleWrapper>
                {/** username */}
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Username
                    </label>
                    <input
                      name="username"
                      placeholder="Username"
                      value={ formik.values.username}
                      className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <ErrorMessage
                      errors={formik.touched.username && formik.errors.username ? true : false}
                      message={formik.errors.username}
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
                      Create Account
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

export default Register;

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
});
