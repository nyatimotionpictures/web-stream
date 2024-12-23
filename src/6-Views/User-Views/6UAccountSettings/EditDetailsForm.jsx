
import { Stack, Typography } from "@mui/material";
import React from "react";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import { FormContainer } from "../../../2-Components/Stacks/InputFormStack";

import * as yup from "yup";
import {  Form, Formik } from "formik";
import ErrorMessage from "../../../2-Components/Forms/ErrorMessage";



const EditDetailsForm = ({innerref, handleStepNext, userData}) => {


  const validationSchema = yup.object().shape({ 
    firstname: yup.string().required("required"),
    lastname: yup.string().required("required"),
    username: yup.string().required("required"),
    email: yup.string().required("required"),
    phoneNumber: yup.string().required("required"),
  });

  const initialValues = {
    firstname: userData?.firstname ?? "",
    lastname: userData?.lastname ?? "", 
    username: userData?.username ?? "",
    email: userData?.email ?? "",
    phoneNumber: userData?.phoneNumber ?? ""
};

 
 
  
  return (
    <Formik
      innerRef={innerref}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, helpers) => {
        handleStepNext(values);
      }}
    >
      {({
        values,
        handleChange,
        errors,
        handleBlur,
        touched,
        setFieldValue,
      }) => (
        <Form>
          <Stack className="h-full w-full flex flex-col gap-5 text-whites-40">
            <Typography className="text-[#F2F2F2] font-[Inter-SemiBold] text-lg">
              Edit Details
            </Typography>

            <CustomStack className="h-full w-full flex flex-col gap-5">
              {/** title && type */}
              <CustomStack className="flex-col justify-between gap-6">
                <FormContainer >
                  <label htmlFor="firstname" className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                    Firstname (required)
                  </label>
                  <input value={values.firstname} onChange={handleChange} onBlur={handleBlur} name="firstname" id="firstname" />
                  <ErrorMessage errors={touched?.firstname && errors?.firstname ? true : false} name="firstname" message={errors?.firstname && errors.firstname} />
                </FormContainer>

                <FormContainer>
                  <label htmlFor="lastname" className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                    Lastname (required)
                  </label>
                  <input value={values.lastname} onChange={handleChange} onBlur={handleBlur} name="lastname" id="lastname" />

                  <ErrorMessage errors={touched?.lastname && errors?.lastname ? true : false} name="lastname" message={errors?.lastname && errors.lastname} />
                </FormContainer>
              </CustomStack>

              {/** genre */}
              <FormContainer>
                <label htmlFor="username" className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                  Username (required)
                </label>
                <input value={values.username} onChange={handleChange} onBlur={handleBlur} name="username" id="username" />

                <ErrorMessage errors={touched?.username && errors?.username ? true : false} name="username" message={errors?.username && errors.username} />
              </FormContainer>
              {/** tagline */}
              <FormContainer>
                <label htmlFor="email" className="label font-[Inter-Regular] text-xs  text-whites-100 text-opacity-75">
                  Email address
                </label>
                <input value={values.email} onChange={handleChange} onBlur={handleBlur} name="email" id="email" />

                <ErrorMessage errors={touched?.email && errors?.email ? true : false} name="email" message={errors?.email && errors.email} />
              </FormContainer>

              <FormContainer>
                <label htmlFor="phoneNumber" className="label font-[Inter-Regular] text-xs  text-whites-100 text-opacity-75">
                  Mobile number
                </label>
                <input value={values.phoneNumber} onChange={handleChange} onBlur={handleBlur} name="phoneNumber" id="phoneNumber" />

                <ErrorMessage errors={touched?.phoneNumber && errors?.phoneNumber ? true : false} name="phoneNumber" message={errors?.phoneNumber && errors.phoneNumber} />
              </FormContainer>
            </CustomStack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default EditDetailsForm;