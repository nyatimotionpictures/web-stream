import React from 'react'
import { Icon } from "@iconify/react"; 
import Button from '../../../2-Components/Buttons/Button';
import { useNavigate } from 'react-router-dom';

const PesaCancel = () => {

  let navigate = useNavigate();
  let path = localStorage.getItem("filmPath") ?? "/"
  return (
    <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative">
           <div className="flex flex-col  items-center text-whites-40  max-w-[287px] gap-40">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 w-full">
          <Icon
            icon="arcticons:ad-block"
            className=" text-[#E20612] flex justify-center items-center w-[40px] h-[40px] border-none border-[0.79px] "
          />
          <h1 className="text-[#E20612] font-[Inter-SemiBold] text-2xl  font-bold text-center lg:text-left">
            Payment Canceled
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
            Your payment failed because you may have insufficient funds / canceled the payment.
          </p>

          <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
            You can try the payment again . Be sure to top-up the right
            amount before submitting your transfer.
          </p>
        </div>
      </div>

      <div className="w-full relative flex flex-col justify-center items-center gap-3">
       
        <Button
          className="w-full rounded-full hover:bg-secondary-600 bg-secondary-700"
          onClick={() => navigate(path, { replace: true })}
        >
          Back to Films
        </Button>
      </div>
    </div>
         </div>
  )
}

export default PesaCancel