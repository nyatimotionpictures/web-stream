import React from 'react'
import { Outlet } from 'react-router-dom';

const OrdinaryRoutes = ({...props}) => {
  return (
    <>
      <Outlet />
    </>
  );
}

export default OrdinaryRoutes