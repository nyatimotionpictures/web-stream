import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import Button from "../../2-Components/Buttons/Button";




const RegisterSuccess = () => {
    let navigate = useNavigate();
    let location = useLocation();
  return (
    <div className="min-h-screen w-full flex flex-col gap-0 bg-secondary-700 items-center justify-center">
        <Stack
            direction="column"
            spacing="70px"
            className="max-w-[408px] mx-auto px-4 md:0"
          >
 
          <Stack
            direction="column"
            spacing="70px"
            className="max-w-[408px] mx-auto"
          >
            <Stack spacing={"30px"} className="w-full">
              <Stack className="mx-auto items-center">
                <Box className="w-max text-[#06CC6B]">
                  
                  <span
                    
                    className="icon-[hugeicons--checkmark-circle-04] h-6 w-6"
                  ></span>
                </Box>
                <h1 className="text-[35px] text-[#06CC6B] text-center font-[Inter-SemiBold]">
                  Congratulations!
                </h1>
              </Stack>
              <Stack spacing={"30px"}>
                <p className="text-[20px] text-[#d0cbca] text-center font-[Inter-Regular]">
                  Thank you, your account has successfully been created
                </p>
                <p className="text-[20px] text-[#d0cbca] text-center font-[Inter-Regular]">
                 Please login  to continue{" "}
                  {/* <span className="text-[#F2F2F2]"> {location.state.contact}</span> */}
                </p>
              </Stack>

              <div>
              <Button
                  onClick={() => navigate("/login", { replace: true })}
                    className="w-full  min-w-[150px] px-4 rounded-full"
                  >
                     Back to Login
                  </Button>

              </div>
            </Stack>
          </Stack>
       

          </Stack>
    </div>
  )
}

export default RegisterSuccess