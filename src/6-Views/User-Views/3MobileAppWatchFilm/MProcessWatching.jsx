import React from 'react'
import CustomLoader from '../../../2-Components/Loader/CustomLoader'
import qs from 'query-string'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';


const MProcessWatching = () => {

    //filmId & Token
    //seasonId & token
    const params = useParams();
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [searchParams] = useSearchParams();
    const search = qs.parse(searchParams.toString());
    let navigate = useNavigate();

    React.useEffect(()=> {

        localStorage.setItem("token", search?.token)
         localStorage.setItem("filmId", params?.filmId)
        // localStorage.setItem("phoneCode", search.phoneCode)
        // localStorage.setItem("paymentNumber", search.paymentNumber)
        if(params?.filmId && search?.token){
            navigate(`/mwatch/${params?.filmId}`, {replace: true})
        }
        console.log("search", search?.token, params?.filmId)
      },[search?.token, params?.filmId]);

  return (
    <div className='w-full h-full'>
        <CustomLoader/>
    </div>
  )
}

export default MProcessWatching