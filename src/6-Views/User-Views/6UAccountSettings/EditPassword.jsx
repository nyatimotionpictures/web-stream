
import { Stack, Typography } from "@mui/material";
import React from "react";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import { FormContainer } from "../../../2-Components/Stacks/InputFormStack";
import * as yup from "yup";

import ErrorMessage from "../../../2-Components/Forms/ErrorMessage";
import { Form, Formik } from "formik";



const EditPassword = ({innerref, handleStepNext, userData}) => {
  const [viewOldPassword, setViewOldPassword] = React.useState(false);
  const [viewNewPassword, setViewNewPassword] = React.useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = React.useState(false);

  const validationSchema = yup.object().shape({ 
    currentPassword: yup.string().required("required"),
    password:  yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
   confirmPassword: yup.string().oneOf([yup.ref('password'), null], "Passwords must match").required("Confirm password is required"),
  });

  const initialValues = {
    currentPassword: "",
    password: "",
    confirmPassword: "",
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
              Edit Password
            </Typography>

            <CustomStack className="h-full w-full flex flex-col gap-5">
              {/** title && type */}
              <CustomStack className="flex-row justify-between gap-6">
                <FormContainer>
                  <label htmlFor="currentPassword" className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                    Current Password (required)
                  </label>
                  <div className="flex flex-col gap-2 h-full relative justify-center">
                  <input   type={viewOldPassword ? "text" : "password"} value={values.currentPassword} onChange={handleChange} onBlur={handleBlur} name="currentPassword" id="currentPassword" />

                  <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewOldPassword ? (
                          <span
                            onClick={()=> setViewOldPassword(!viewOldPassword)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                          onClick={()=> setViewOldPassword(!viewOldPassword)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                  </div>
                 
                  <ErrorMessage errors={touched?.currentPassword && errors?.currentPassword ? true : false} name="currentPassword" message={errors?.currentPassword && errors.currentPassword} />
                </FormContainer>
              </CustomStack>

              {/** genre */}
              <FormContainer>
                <label className="label font-[Inter-Regular] text-xs text-whites-100 text-opacity-75">
                  New Password (required)
                </label>
              

                <div className="flex flex-col gap-2 h-full relative justify-center">
                <input type={viewNewPassword ? "text" : "password"} value={values.password} onChange={handleChange} onBlur={handleBlur} name="password" id="password" />

                  <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewNewPassword ? (
                          <span
                            onClick={()=> setViewNewPassword(!viewNewPassword)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                          onClick={()=> setViewNewPassword(!viewNewPassword)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                  </div>
                <ErrorMessage errors={touched?.password && errors?.password ? true : false} name="password" message={errors?.password && errors.password} />
              </FormContainer>
              {/** tagline */}
              <FormContainer>
                <label className="label font-[Inter-Regular] text-xs  text-whites-100 text-opacity-75">
                  Confirm Password (required)
                </label>


                <div className="flex flex-col gap-2 h-full relative justify-center">
                <input  type={viewConfirmPassword ? "text" : "password"} value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} name="confirmPassword" id="confirmPassword" />

                  <div className=" w-max flex items-center justify-center px-0 py-0  absolute text-whites-40 right-3  m-auto hover:text-primary-500  z-50">
                        {!viewConfirmPassword ? (
                          <span
                            onClick={()=> setViewConfirmPassword(!viewConfirmPassword)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                          onClick={()=> setViewConfirmPassword(!viewConfirmPassword)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                  </div>
               

                <ErrorMessage errors={touched?.confirmPassword && errors?.confirmPassword ? true : false} name="confirmPassword" message={errors?.confirmPassword && errors.confirmPassword} />
              </FormContainer>
            </CustomStack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default EditPassword;