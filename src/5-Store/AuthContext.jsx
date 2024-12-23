import { createContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null);


    const updateUser = (data) => {
        
            setCurrentUser(data);
            <Navigate to="/"/>
        
       
    };

    useEffect(() => {
        if (currentUser === null) {
            <Navigate to="/login"/>
        } else {
            localStorage.setItem("user", JSON.stringify(currentUser))
        }
        
    },[currentUser])

  return <AuthContext.Provider value={{currentUser, updateUser}}>{children}</AuthContext.Provider>;
};
