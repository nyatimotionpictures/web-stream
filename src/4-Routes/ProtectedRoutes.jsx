import React, { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../5-Store/AuthContext";

const ProtectedRoutes = () => {
  const { currentUser } = useContext(AuthContext);

  // useEffect(() => {
  //     if (!currentUser) {
  //         <Navigate to="/login"/>
  //     }
  // },[currentUser])
  return <>{!currentUser ? <Navigate to="/login" replace/> : <Outlet />}</>;
};

export default ProtectedRoutes;
