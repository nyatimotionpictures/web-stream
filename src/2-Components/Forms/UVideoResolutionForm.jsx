import { Form, Formik } from "formik";
import React from "react";
import * as yup from "yup";
import CustomStack from "../Stacks/CustomStack";
import { FormContainer } from "../Stacks/InputFormStack";
import ErrorMessage from "./ErrorMessage";

const resolutionData = {
  SD: {
    resolution: "480p",
    name: "SD (480p)",
  },
  HD: {
    resolution: "720p",
    name: "HD (720p)",
  },
  FHD: {
    resolution: "1080p",
    name: "Full HD (1080p)",
  },
  UHD: {
    resolution: "2160p",
    name: "Ultra HD (2160p)",
  },
};

const UVideoResolutionForm = ({ innerref, handleStepNext, film, allAvailableResolutions, pricingData }) => {
  console.log("film", film);
  console.log("videos", film?.video);
  const validationSchema = yup.object().shape({
    resolution: yup.string().required("required"),
    resolutionId: yup.string().required("required"),
    resourceId: yup.string().required("required"),
    type: yup.string().required("required"),
  });

  const initialValues = {
    resolution: "",
    resolutionId: "",
    resourceId: film?.id,
    type: film?.type?.includes("film") ? "film" : "season",
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
          <CustomStack className="h-full w-full flex flex-col gap-5 text-whites-40">
            <div className="flex flex-col gap-2">
              <h1 className="font-[Roboto-Regular] text-xl md:text-2xl text-whites-40 ">
                Select Video Quality
              </h1>

              <p className="font-[Roboto-Regular] text-lg text-whites-40 text-opacity-60">
                Choose the video quality that suits your device and proceed to
                payment to watch the {film?.type?.includes("film") ? "film" : "all the episodes"}.
              </p>
            </div>

            {/** Season Number */}
            <FormContainer>
              <CustomStack className="flex flex-col gap-2">
                {allAvailableResolutions?.map((data, index) => {
                  console.log(data)
                  return (
                    <div key={index} className="flex gap-2 items-center ">
                      
                        <label className="flex flex-row w-max gap-4 items-center">
                          <input
                            checked={values.resolution === data.resolution}
                            id="resolution"
                            type="radio"
                            value={data.resolution}
                            name="resolution"
                            className="h-max w-max"
                            onChange={() => {
                              setFieldValue("resolution", data.resolution);
                              setFieldValue(
                                "resolutionInfo",
                                `${resolutionData[data.resolution].name} - ${
                                  pricingData?.currency
                                } ${data?.price}`
                              );
                              setFieldValue("resolutionId", data.id);
                            }}
                            placeholder="Resolution"
                            onBlur={handleBlur}
                          />

                          <div
                            htmlFor="resolution"
                            className="label w-full font-[Inter-Regular] text-base text-whites-100 text-opacity-75"
                          >
                            {resolutionData[data.resolution].name} -{" "}
                            <span className="uppercase  !text-opacity-100 !text-whites-40">
                              {pricingData?.currency +
                                " " +
                                data?.price}
                            </span>
                          </div>
                        </label>
                     
                    </div>
                  );
                })}
              </CustomStack>

              <ErrorMessage
                errors={
                  touched?.resolution && errors?.resolution ? true : false
                }
                name="season"
                message={errors?.resolution && errors.resolution}
              />
            </FormContainer>
          </CustomStack>
        </Form>
      )}
    </Formik>
  );
};

export default UVideoResolutionForm;
