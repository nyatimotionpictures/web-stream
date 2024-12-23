import React, { useContext } from 'react'
import UPurchaseTabs from './UPurchaseTabs';


import styled from 'styled-components';
import { Stack } from '@mui/material';
import WebNavigation from '../../../2-Components/Navigation/WebNavigation';
import Footer from '../../../2-Components/Footer/Footer';
import { AuthContext } from '../../../5-Store/AuthContext';
import { useGetPurchaseList } from '../../../5-Store/TanstackStore/services/queries';

const UPurchaseList = () => {
  const userData = useContext(AuthContext)

  const purchaselistQuery = useGetPurchaseList(userData?.currentUser?.user?.id);


  let allPurchased =  React.useMemo(()=>{
    return purchaselistQuery?.data?.purchased.filter((film)=> {
      return film
    })
  },[purchaselistQuery?.data])

  let filmsPurchased =  React.useMemo(()=>{
    return purchaselistQuery?.data?.purchased.filter((film)=> {
     if (film.type === "film" || film.type === "movie" ) {
      return film
     }
    })
  },[purchaselistQuery?.data])

  let showsPurchased =  React.useMemo(()=>{
    return purchaselistQuery?.data?.purchased.filter((film)=> {
      if (film.type === "episode"  ) {
       return film
      }
     })
  },[purchaselistQuery?.data])
  return (
    <Container className="w-full h-full relative flex-col space-y-0 bg-secondary-800">
      <WebNavigation isLoggedIn={true} />
      <Stack className="flex-col w-full h-full space-y-0">
        <div className="px-4 pt-28 md:px-16 md:pt-36">
          <UPurchaseTabs allPurchased={allPurchased} filmsPurchased={filmsPurchased} showsPurchased={showsPurchased} />
        </div>
      </Stack>
      <Footer />
    </Container>
  );
}

export default UPurchaseList

const Container = styled(Stack)`
  overflow-x: hidden !important;
  overflow-y: auto !important;
`;