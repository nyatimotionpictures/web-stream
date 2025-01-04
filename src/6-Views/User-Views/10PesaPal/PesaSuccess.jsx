import { Button } from '@mui/material';
import React from 'react'
import { BaseUrl } from '../../../3-Middleware/apiRequest';
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from 'react-router-dom';

const PesaSuccess = () => {
    const [responseData, setResponseData] = React.useState(null)
    let [searchParams] = useSearchParams();
    let getOrderId = searchParams.get("OrderTrackingId");
     let navigate = useNavigate();
      let path = localStorage.getItem("filmPath") ?? "/"

    let GetTransaction = async (Id) => {
        //console.log("id", Id)
        let getStatus = await axios.get(`${BaseUrl}/v1/film/pesapal/checkpaymentstatus?OrderTrackingId=${Id}`, { headers: { "content-type": "application/json" } });
        //console.log("getStatus", getStatus.data)
        if (getStatus.data) {

            setResponseData(() => getStatus.data)
            
        }
    }

    const handleClose = () => {
      localStorage.removeItem("filmPath");
      navigate(path, { replace: true })
      };

      React.useEffect(() => {
        if (getOrderId) {
            GetTransaction(getOrderId)
        }



    }, [getOrderId])
  return (
    <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative"> 
    <div className="flex flex-col  items-center text-whites-40  max-w-[287px] gap-20">
     <div className="flex flex-col gap-5">
       <div className="flex flex-col items-center gap-4 w-full">
         <Icon
           icon="arcticons:ticktick"
           className=" text-[#06CC6B] flex justify-center items-center w-[40px] h-[40px] border-none border-[0.79px] "
         />
         <h1 className="text-[#06CC6B] font-[Inter-SemiBold] text-2xl  font-bold text-center lg:text-left">
           Payment Successful
         </h1>
       </div>

       <div className="flex flex-col gap-6">
         <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
           Your payment is confirmed. <br />
           Enjoy watching <br />
         </p>

         <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
           You have 72hrs to view the movie.
         </p>

         <p className="text-[#FFFAF6] text-center font-[Inter-Regular] text-base text-opacity-80  ">
           If you have any inquiries with this payment contact:
         </p>

         <p className="text-[#FFFAF6] text-center font-[Inter-Bold] text-base ">
           info@nyatimotionpictures.com
         </p>
       </div>
     </div>

     <div className="w-full relative flex justify-center items-center ">
       <Button
         onClick={handleClose}
         className="w-full rounded-full text-whites-50 font-[Roboto-Medium] text-base"
       >
         Close
       </Button>
     </div>
   </div>
   </div>
  )
}

export default PesaSuccess