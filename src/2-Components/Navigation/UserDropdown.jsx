import React from 'react'
import { NavLink, useLocation, } from 'react-router-dom';
import styled from 'styled-components';
const UserDropdown = ({dropdown, userRef, mutation,currentUserData}) => {
  
  let location = useLocation()
  return (
    <SubMenuWrap
    ref={userRef}
      className={`absolute right-0 h-max overflow-hidden rounded-lg bg-secondary-900 w-max shadow-lg z-40  ${
        dropdown ? "flex flex-col z-50" : "hidden"
      }`}
    >
      <li className="h-[40px] w-[200px] z-50"     >
        <NavLink
        
         role="button"
         to={"/account"}
          //onClick={()=> navigate("/account")}
          
       
          className={({ isActive }) =>
            isActive && location.pathname.includes("/account")
              ? "flex items-center px-6 h-full w-full bg-primary-100 font-[Inter-SemiBold] text-sm capitalize lg:text-base"
              : "flex items-center px-6 h-full w-full border-b-2 border-b-transparent font-[Inter-Regular] text-sm lg:text-base hover:bg-secondary-200 capitalize text-whites-50"
          }
        >
          Account Settings
        </NavLink>
      </li>

      <li className="h-[40px] w-[200px] ">
        <div
          role="button"
          disabled={mutation.isPending ? true : false}
          onClick={() => mutation.mutate(
            currentUserData && currentUserData?.id ? currentUserData?.id : null
          )}
          
          className={"flex items-center px-6 h-full w-full border-b-2 border-b-transparent font-[Inter-Regular] text-sm lg:text-base hover:bg-secondary-200 capitalize text-whites-50"}
        >
          {
             mutation.isPending ? "signing out..." : "Sign Out"
          }
       
        </div>
      </li>
    </SubMenuWrap>
  );
}

export default UserDropdown  

const SubMenuWrap = styled.ul`
z-index: 1;
`;