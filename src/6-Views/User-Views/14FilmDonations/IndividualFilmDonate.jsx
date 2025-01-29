import React, { useContext } from 'react'
import Footer from '../../../2-Components/Footer/Footer'
import WebNavigation from '../../../2-Components/Navigation/WebNavigation'
import { Stack } from '@mui/material'
import HeroProd from './HeroProd'
import ContentProd from './ContentProd'
import DonateProd from './DonateProd'
import { useParams } from 'react-router-dom'
import { useGetFilm } from '../../../5-Store/TanstackStore/services/queries'
import { AuthContext } from '../../../5-Store/AuthContext'

const IndividualFilmDonate = () => {
  const [currentUserData, setCurrentUserData] = React.useState(null);
  let params = useParams();
   const userData = useContext(AuthContext);
   const filmsQuery = useGetFilm(params?.id);


    React.useEffect(() => {
       if (userData.currentUser !== null) {
         setCurrentUserData(userData.currentUser?.user);
       } else {
         navigate("/login", { replace: true });
       }
       //console.log("userData", userData);
     
     }, [userData.currentUser?.user.id]);

   console.log("filmsQuery", filmsQuery?.data?.film);
  return (
    <div className="relative px-0 w-full h-full bg-secondary-900 overflow-x-hidden">
   <WebNavigation isLoggedIn={true} />

   <Stack className="flex-col w-full h-full space-y-0">
      <HeroProd film={filmsQuery?.data?.film} />
      <ContentProd film={filmsQuery?.data?.film} />
      <DonateProd user={userData.currentUser?.user} film={filmsQuery?.data?.film} />
      <Footer />
    </Stack>
  </div>
  )
}

export default IndividualFilmDonate