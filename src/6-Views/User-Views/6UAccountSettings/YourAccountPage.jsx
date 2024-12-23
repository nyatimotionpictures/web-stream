import React, { useContext } from "react";
import Sidebar from "../../../2-Components/Navigation/Sidebar";
import STopbar from "../../../2-Components/Navigation/STopbar";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";

import EditDetailsForm from "./EditDetailsForm";
import EditPassword from "./EditPassword";
import Button from "../../../2-Components/Buttons/Button";
import { AuthContext } from "../../../5-Store/AuthContext";
import moment from "moment-timezone";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import { useMutation } from "@tanstack/react-query";
import { putUpdateUser } from "../../../5-Store/TanstackStore/services/api";

const YourAccountPage = () => {
  const [currentUserData, setCurrentUserData] = React.useState(null);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const userData = useContext(AuthContext);
  let formRef = React.useRef();

  React.useEffect(() => {
    if (userData.currentUser !== null) {
      setCurrentUserData(userData.currentUser?.user);
    } else {
      navigate("/login", { replace: true });
    }
    //console.log("userData", userData);
  
  }, [userData.currentUser?.user.id]);

  console.log("currentUserData", currentUserData);

  const handleEditDetails = () => {
    setIsEditDetailsOpen(() => !isEditDetailsOpen);
  }

  const handleEditPassword = () => {
    setIsEditPasswordOpen(() => !isEditPasswordOpen);
  }

  const mutation = useMutation({
    mutationFn: putUpdateUser,
    onSuccess: (data)=> {
      setSnackbarMessage({message: data.message, severity: "success"});
    },
    onError: (error) => {
      setSnackbarMessage(() => ({message: error.message, severity: "error"}));
    },
  })

  const handleDetailAPISubmit = (values) => {
    console.log("values", values)
    //  alert(`form submitted ${editInfo.title}`);
   // createMutation.mutate(values)
    //handleFormSubmit()
    mutation.mutate(values)
   
  }

  const handlePasswordAPISubmit = (values) => {
    console.log("values", values)
    //  alert(`form submitted ${editInfo.title}`);
   // createMutation.mutate(values)
    //handleFormSubmit()
    mutation.mutate(values)
  

  }

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    } else {
      alert("No form")
    }
  }

  return (
    <Stack
      spacing={"0"}
      className="max-h-screen h-[100vh] w-full flex flex-col bg-whites-900 relative"
    >
      <STopbar />

      <div className=" md:grid md:grid-cols-[auto,1fr] flex-grow-1 relative h-screen overflow-x-hidden overflow-y-auto">
       
        <Sidebar />
      
     

        {/** content */}
        <div className="bg-secondary-700 md:h-full px-4 md:px-[38px] pt-[14px]  md:pb-[40px]">
          <Stack direction="column" spacing="48px" >
            {/** account */}
            <Stack spacing="35px">
              <div className="flex flex-col space-y-1">
                <Typography className="text-whites-40 text-[18px] font-[Inter-SemiBold] ">
                  Account{" "}
                </Typography>
                <Typography className="text-whites-40 text-[14px] font-[Inter-SemiBold] text-opacity-40">
                  Membership Details
                </Typography>
              </div>

              <Stack className="flex flex-col space-y-2">
                {/** acc details */}
                <Box className="flex flex-col md:flex-row md:items-center justify-between min-h-[155px] bg-[#36323e] w-full md:min-w-[70%] md:w-max rounded-lg px-4 md:px-[35px] py-[20px] text-whites-40 space-y-2">
                  <Stack>
                    <Typography className="font-[Inter-Medium] text-[20px]">
                      User Details
                    </Typography>

                    <Stack>
                      <Typography className="font-[Inter-Regular] text-[15px]">
                        Member since:{" "}
                        {moment(currentUserData?.createdAt).format("MMM")}{" "}
                        {moment(currentUserData?.createdAt).format("YYYY")}
                      </Typography>
                      <Typography className="font-[Inter-Regular] text-[15px]">
                        Username: {currentUserData?.username}
                      </Typography>
                      <Typography className="font-[Inter-Regular] text-[15px]">
                        Fullname: {currentUserData?.lastname}{" "}
                        {currentUserData?.firstname}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button onClick={handleEditDetails} className="rounded-full h-max px-10 font-[Roboto-Medium]">
                    Update
                  </Button>
                </Box>
                {/** acc details */}
                <Box className="flex flex-row items-center justify-between min-h-[75px] bg-[#36323e] md:min-w-[70%] md:w-max rounded-lg px-4 md:px-[35px] py-[20px] text-whites-40 space-y-2">
                  <Stack spacing="0">
                    <Box className="flex items-start space-x-2">
                      <span className="icon-[solar--letter-linear] h-6 w-6"></span>
                      <Typography className="font-[Inter-Medium] text-[20px]">
                        Email
                      </Typography>
                    </Box>
                    <Typography className="font-[Inter-Regular] text-[15px] pl-8">
                      {currentUserData?.email}
                    </Typography>
                  </Stack>
                </Box>
                {/** acc details */}
                <Box className="flex flex-row items-center justify-between min-h-[55px] bg-[#36323e] md:min-w-[70%] md:w-max rounded-lg px-4 md:px-[35px] py-[20px] text-whites-40 space-y-2">
                  <Stack spacing="0">
                    <Box className="flex items-start space-x-2">
                      <span className="icon-[solar--smartphone-linear] h-6 w-6"></span>
                      <Typography className="font-[Inter-Medium] text-[19px]">
                        Mobile Number
                      </Typography>
                    </Box>
                    <Typography className="font-[Inter-Regular] text-[15px] pl-8">
                      {currentUserData?.phoneNumber
                        ? currentUserData?.phoneNumber
                        : "-"}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Stack>
            {/** security */}

            <Stack spacing="15px" className="pb-8">
              <div className="flex flex-col space-y-1">
                <Typography className="text-whites-40 text-[18px] font-[Inter-SemiBold] uppercase">
                  Security
                </Typography>
              </div>

              <Box className="flex flex-col md:flex-row md:items-center justify-between min-h-[55px] bg-[#36323e] md:min-w-[70%] md:w-max rounded-lg px-4 md:px-[35px] py-[20px] text-whites-40 space-y-2">
                <Stack>
                  <Box className="flex items-center space-x-2">
                    <span className="icon-[solar--lock-password-linear] h-6 w-7"></span>
                    <Typography className="font-[Inter-Medium] text-[20px]">
                      Password
                    </Typography>
                  </Box>
                </Stack>

                <Button onClick={handleEditPassword} className="rounded-full h-max px-10 font-[Roboto-Medium]">
                  Change
                </Button>
              </Box>
            </Stack>
          </Stack>
        </div>
      </div>

{/** edit details modal */}
      {isEditDetailsOpen && (
        <CustomStack
          className="relative z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="false"
        >
          <div className="fixed inset-0 border rounded-xl bg-secondary-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-50 bg-primary-200 bg-opacity-10 overflow-hidden">
            <div className="relative transform overflow-y-auto rounded-lg  bg-opacity-20 flex items-center justify-center h-screen text-left shadow-xl transition-all">
              <div className="bg-secondary-900 px-5 md:px-16 pt-0 w-full max-w-[700px] rounded-lg h-screen  md:h-max">
                {/**  forms  */}
                <div className="flex flex-col w-full h-full text-whites-40 gap-6 relative">
                  <CustomStack className="z-50 w-full justify-between items-center py-2 pt-7 sticky top-0 bg-secondary-900">
             

                    {/* <div className="flex gap-5">
                                              <Button onClick={handleEditDetails} className="px-5 rounded-lg font-[Inter-Medium] bg-primary-700">
                                                  CANCEL & CLOSE
                                              </Button>
                                          </div> */}
                  </CustomStack>

                  {/** stepper show case */}

                  {/** form */}
                  <div className="block mb-3 h-full">
                    <EditDetailsForm
                      innerref={formRef}
                      handleStepNext={handleDetailAPISubmit}
                      userData={currentUserData}
                      setSnackbarMessage={setSnackbarMessage}
                    />
                  </div>

                  {/** stepper control */}
                  <div className="border-t-2 border-t-secondary-500 relative">
                    <div className="container flex flex-col-reverse md:flex-row items-center justify-end mx-0 gap-4  mt-4 mb-8 ">
                      <Button
                      onClick={handleEditDetails}
                        className={`min-w-full md:min-w-[150px] bg-white text-slate-400 uppercase px-10 py-2 rounded-lg cursor-pointer border border-slate-300 hover:bg-slate-700 hover:text-whites-40 transition duration-200 ease-in-out text-primary-500
             `}
                      >
                        close
                      </Button>

                      <Button
                        onClick={handleFormSubmit}
                        className=" min-w-full md:w-max md:min-w-[150px] px-5 rounded-lg"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomStack>
      )}


{/** edit password modal */}
{isEditPasswordOpen && (
        <CustomStack
          className="relative z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="false"
        >
          <div className="fixed inset-0 border rounded-xl bg-secondary-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-50 bg-primary-200 bg-opacity-10 overflow-hidden">
            <div className="relative transform overflow-y-auto rounded-lg  bg-opacity-20 flex items-center justify-center h-screen text-left shadow-xl transition-all">
              <div className="bg-secondary-900 px-5 md:px-16 pt-0 w-full max-w-[700px] rounded-lg h-screen md:h-max">
                {/**  forms  */}
                <div className="flex flex-col w-full h-full text-whites-40 gap-6 relative">
                  <CustomStack className="z-50 w-full justify-between items-center py-2 pt-7 sticky top-0 bg-secondary-900">
             

                    {/* <div className="flex gap-5">
                                              <Button onClick={handleEditPassword} className="px-5 rounded-lg font-[Inter-Medium] bg-primary-700">
                                                  CANCEL & CLOSE
                                              </Button>
                                          </div> */}
                  </CustomStack>

                  {/** stepper show case */}

                  {/** form */}
                  <div className="block mb-3 h-full">
                    <EditPassword
                      innerref={formRef}
                      handleStepNext={handlePasswordAPISubmit}
                      userData={currentUserData}
                      setSnackbarMessage={setSnackbarMessage}
                    />
                  </div>

                  {/** stepper control */}
                  <div className="border-t-2 border-t-secondary-500 relative">
                    <div className="container flex flex-col-reverse md:flex-row items-center justify-end mx-0 gap-4  mt-4 mb-8 ">
                      <Button
                      onClick={handleEditPassword}
                        className={`min-w-full md:min-w-[150px] bg-white text-slate-400 uppercase px-10 py-2 rounded-lg cursor-pointer border border-slate-300 hover:bg-slate-700 hover:text-whites-40 transition duration-200 ease-in-out text-primary-500
             `}
                      >
                        close
                      </Button>

                      <Button
                        onClick={handleFormSubmit}
                        className="min-w-full md:w-max md:min-w-[150px] px-5 rounded-lg"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomStack>
      )}

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

    </Stack>
  );
};

export default YourAccountPage;