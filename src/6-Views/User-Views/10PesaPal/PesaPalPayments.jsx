import React, { useContext } from 'react'

import { useLocation, useNavigate } from 'react-router-dom';
import CustomLoader from '../../../2-Components/Loader/CustomLoader';

const PesaPalPayments = () => {
    let location = useLocation();
    
    const [modalLoading, setModalLoading] = React.useState(true)
    // let navigate = useNavigate();

    React.useEffect(() => {
        if (location?.state?.option !== null || location?.state?.option !== undefined) {
         if (location?.state?.option === "airtelmoney" || location?.state?.option === "visa") {
                setModalLoading(() => false)
            }
        }
    }, [location?.state?.option]);

  return (
    <div className="bg-white min-h-[100vh] w-full  flex flex-col py-8 sm:py-16 max-w-[90%] px-5   sm:px-16 gap-[20px] !overflow-y-auto">
         
    {/** loader */}
    {modalLoading ? <CustomLoader /> : null}

    {/** Visa A-frame */}
    {
        !modalLoading &&  (
            <div className="flex-grow h-full flex flex-col gap-[50px]">

                <iframe className="w-full h-full flex-grow" src={location?.state?.redirectpath}></iframe>
            </div>
        )
    }


</div>
  )
}

export default PesaPalPayments