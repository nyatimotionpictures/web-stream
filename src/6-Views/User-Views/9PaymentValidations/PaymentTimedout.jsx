import React from 'react'
import Button from '../../../2-Components/Buttons/Button';
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';

const PaymentTimedout = () => {
    let navigate = useNavigate();
  return (
    <div className="flex flex-col  items-center text-whites-40  max-w-[287px] gap-40">
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-4 w-full">
        <Icon
          icon="arcticons:chrono24"
          className=" text-[#B3B3B3] flex justify-center items-center w-[40px] h-[40px] border-none border-[0.79px] "
        />
        <h1 className="text-[#B3B3B3] font-[Inter-SemiBold] text-2xl  font-bold text-center lg:text-left">
          Payment Timed Out
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
          It seems your paymet didn&apos;t go through in time.
        </p>

        <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
          Please try again to complete your purchase. If the issue persists,
          feel free to contact us at:
        </p>

        <p className="text-[#FFFAF6] text-center font-[Inter-Bold] text-base ">
          info@nyatimotionpictures.com
        </p>
      </div>
    </div>

    <div className="w-full relative flex justify-center items-center ">
      <Button
        className="w-full rounded-full"
        onClick={() => navigate("/", { replace: true })}
      >
        Close
      </Button>
    </div>
  </div>
  )
}

export default PaymentTimedout