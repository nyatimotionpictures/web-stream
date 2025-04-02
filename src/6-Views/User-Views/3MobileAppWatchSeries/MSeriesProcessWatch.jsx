import React from 'react'
import CustomLoader from '../../../2-Components/Loader/CustomLoader'
import qs from 'query-string'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const MSeriesProcessWatch = () => {

     //filmId & Token
    //seasonId & token
    const params = useParams();
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [searchParams] = useSearchParams();
    const search = qs.parse(searchParams.toString());
    let navigate = useNavigate();

    React.useEffect(()=> {

        localStorage.setItem("token", search?.token)
         localStorage.setItem("seasonId", params?.seasonId)
        // localStorage.setItem("phoneCode", search.phoneCode)
        // localStorage.setItem("paymentNumber", search.paymentNumber)
        if(params?.seasonId && search?.token){
            navigate(`/mwatch/s/${params?.seasonId}`, {replace: true})
        }
        console.log("search", search?.token, params?.seasonId)
      },[search?.token, params?.seasonId]);
  return (
    <div className='w-full h-full'>
        <CustomLoader/>
    </div>
  )
}

export default MSeriesProcessWatch