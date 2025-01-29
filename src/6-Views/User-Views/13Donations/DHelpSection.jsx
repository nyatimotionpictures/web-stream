import React from 'react'
import iconImg from "../../../1-Assets/Union.svg";
import LpImage from "../../../1-Assets/laptop.png";
import Button from '../../../2-Components/Buttons/Button';

const DHelpSection = () => {
  return (
    <div className="min-h-[60vh] h-full lg:min-h-screen flex flex-col bg-[#141118] items-center justify-center px-[30px] py-16 sm:px-16 md:py-16 lg:py-16 w-screen overflow-hidden relative">
    {/* container */}
    <div className="w-full h-full flex flex-col lg:flex-row mt-16 lg:mt-[100px] justify-between items-center md:px-[5%] md:mt-[80px] py-0">
      {/* icon, text & button */}
      <div className="w-full lg:max-w-[350px] xl:max-w-[400px] flex flex-col items-center lg:items-start justify-center gap-3 md:gap-5 lg:gap-5  lg:text-left text-center">
        {/* icon */}
        <div className="w-[57px] h-[57px] rounded-full bg-[#F7A8B8] flex flex-col items-center justify-center relative">
          <img src={iconImg} alt="" className="w-[50%]" />
        </div>

        {/* heading */}
        <h1 className="text-3xl md:text-3xl xl:text-5xl text-[#FFFFFE] font-bold md:max-w-[219px] capitalize lg:max-w-[319px] font-[Inter-Bold]">
          Help us share our stories 
        </h1>

        {/* paragraph */}
        <p className="text-[#FFFAF6] text-opacity-70 font-[Inter-Regular] text-[14px] sm:text-[15px] xl:text-lg font-light">
          Nyati Motion Pictures is dedicated to retelling African stories with
          passion. Producing high-quality content requires millions of
          shillings, and that’s where you come in.
        </p>

        {/* button */}
        {/* <div className="hidden lg:flex justify-center lg:justify-start">
          <Button
            className="bg-[#EE5170] w-[190.34px] h-[41.38px] rounded-[49.66px]
            font-[Inter-SemiBold] font-semibold text-16 lg:text-[15px] leading-19.36 text-[#FFFAF6] cursor-pointer lg:mt-[20px]"
            // onClick={() => handleAmountOpen()}
          >
            Send Us A Donation
          </Button>
        </div> */}
      </div>

      {/* image */}
      <div className="w-full  lg:w-auto flex justify-center lg:mt-8 md:mt-0">
        <img
          src={LpImage}
          alt="icon"
          className="max-w-[100%] h-full w-full size-full  sm:max-w-[400px] md:max-w-[540px] lg:max-w-[640px]"
        />
      </div>

      {/* <div className=" flex lg:hidden justify-center lg:mb-4 lg:justify-start">
        <Button
          className="bg-[#EE5170] w-[190.34px] h-[41.38px] rounded-[49.66px]
            font-inter font-semibold text-16 leading-19.36 text-[#FFFAF6] cursor-pointer"
        //   onClick={() => handleAmountOpen()}
        >
          Send Us A Donation
        </Button>
      </div> */}
    </div>
  </div>
  )
}

export default DHelpSection