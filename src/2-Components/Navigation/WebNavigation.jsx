import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import CustomStack from "../Stacks/CustomStack";
import { Avatar, Typography } from "@mui/material";
import { MENUDATA, MENULOGIN } from "../../1-Assets/data/MenuData";
import Logo from "../../1-Assets/logos/Logo.svg";
import MenuItems from "./MenuItems";

import MobileItems from "./MobileItems.jsx";
// import { Avatar, Wrap, WrapItem } from "@chakra-ui/react";
import UserDropdown from "./UserDropdown.jsx";
import Button from "../Buttons/Button.tsx";
import { AuthContext } from "../../5-Store/AuthContext.jsx";
import { useMutation } from "@tanstack/react-query";
import { postAuthLogout } from "../../5-Store/TanstackStore/services/api.ts";
import { queryClient } from "../../lib/tanstack.ts";

const WebNavigation = ({ isLoggedIn, blur }) => {
  const [nav, setNav] = React.useState(false);
  const [navSolid, setNavSolid] = React.useState(false);
  const [dropDown, setDropDown] = React.useState(false);
  const [currentUserData, setCurrentUserData] = React.useState(null);
  const userData = useContext(AuthContext);
  let ref = React.useRef();
  let routeNavigate = useNavigate();
  const mutation = useMutation({
    mutationFn: postAuthLogout,
    onSuccess: (data) => {
      queryClient.clear();
      localStorage.clear();
      //localStorage.removeItem("user");
      routeNavigate("/login", { replace: true });
    },
    onError: (error) => {
      // setErroressage(()=> `Login Failed: ${error.message}`)
    },
  });

  

  React.useEffect(() => {
    if (userData.currentUser !== null) {
      setCurrentUserData(userData.currentUser?.user);
    } else {
      navigate("/login", { replace: true });
    }
    //console.log("userData", userData);
  
  }, [userData.currentUser?.user?.id]);

 
  const handleNav = () => {
    setNav(!nav);
  };

  const handlePopupToggle = (e) => {
    e.preventDefault();
  };
  
  const navSolidChange = () => {
    if (window.scrollY >= 120) {
      if (!navSolid) setNavSolid(true);
    } else {
      setNavSolid(false);
    }
  };

  window.addEventListener("scroll", navSolidChange);

  React.useEffect(() => {
    const handler = (event) => {
      if (dropDown && ref.current && !ref.current.contains(event.target)) {
        setDropDown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropDown]);

  const onMouseClick = () => {
    setDropDown(!dropDown);
  };
  return (
    <NavContainer className={`absolute items-center h-[85px] w-full mx-auto px-5 lg:px-14 z-50 ${blur ? "bg-secondary-900 bg-opacity-20" : ""}`}>
      <CustomStack className="w-full h-full justify-between  items-center max-w-[1280px] mx-auto overflow-hidden">
        {/** menu logo & items */}
        <CustomStack className="bg-transparent  space-x-20 items-center">
          <div
            className="mx-0 mt-0 select-none cursor-pointer lg:w-24 lg:h-24"
            onClick={() => routeNavigate("/", { replace: true })}
          >
            <img src={Logo} alt="" className="w-full h-full" />
          </div>

          {isLoggedIn ? (
            <ul className="hidden lg:flex w-full space-x-5 h-[60%]">
              {MENULOGIN.map((data, index) => {
                return <MenuItems key={index} item={data} />;
              })}
            </ul>
          ) : (
            <ul className="hidden lg:flex w-full space-x-5 h-[60%]">
              {MENUDATA.map((data, index) => {
                return <MenuItems key={index} item={data} />;
              })}
            </ul>
          )}
        </CustomStack>
        {/** menu action button */}
        {isLoggedIn ? (
          <div className="hidden lg:flex lg:space-x-2 lg:items-center lg:h-full">
            <Button    onClick={()=> routeNavigate("/browse")} variant="ghost" className="h-10">
              <span className="icon-[solar--magnifer-linear] h-6 w-6 text-whites-40"></span>
            </Button>

            <div>
              <div>
                <Avatar
                  name="Joshua Kimbareeba"
                  src=""
                  className="bg-primary-500 rounded-full p-3 w-10 h-10 font-[Inter-Bold] select-none cursor-pointer"
                  size="md"
                />
              </div>
            </div>
            <div className="block z-50 space-y-3">
              <div ref={ref} onClick={onMouseClick} className="relative h-max">
                <Button
                  variant="ghost"
                  className="w-10 h-10 rounded-full px-0 hover:bg-whites-40 text-whites-40 hover:text-secondary-800 hover:bg-opacity-70"
                >
                  <span className="icon-[solar--alt-arrow-down-linear] h-7 w-7"></span>
                </Button>
              </div>
              
              <UserDropdown dropdown={dropDown} userRef={ref} mutation={mutation} currentUserData={currentUserData} />
              
              
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex">
            <ActionButton
              as={"button"}
              onClick={() => routeNavigate("/auth/signin")}
              className="font-[Roboto-Medium] text-lg text-whites-40"
            >
              <span>Sign In</span>
            </ActionButton>
          </div>
        )}

        {/** Mobile hanburger  & search icon*/}
        <div className="flex flex-row gap-2 lg:hidden items-center">

        <Button
        onClick={()=> routeNavigate("/browse")}
          variant="ghost"
          className="text-secondary-50 flex lg:hidden rounded-full px-0 py-0 m-0"
          
        >
          <span className="icon-[solar--magnifer-linear] h-6 w-6 text-whites-40"></span>
        </Button>

        <Button
          variant="ghost"
          className="text-secondary-50 flex lg:hidden rounded-full px-0 py-0 m-0"
          onClick={handleNav}
        >
          {nav ? (
            <span className="icon-[ion--close] text-5xl"></span>
          ) : (
            <span className="icon-[solar--hamburger-menu-broken] text-5xl"></span>
          )}
        </Button>

        </div>

        

        {/** Mobile Menu */}
        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[80%] h-full border-r border-r-gray-900 overflow-hidden flex flex-col justify-around bg-[#141118]  ease-in-out duration-500 lg:hidden"
              : "fixed left-[-100%] top-0 w-[80%] h-full border-r border-r-gray-900 overflow-hidden flex flex-col justify-around bg-[#141118]  ease-linear duration-500 lg:hidden"
          }
        >
          <div className="flex flex-col items-center justify-start h-screen space-y-2 pb-4 overflow-hidden">
            <div className="h-10"></div>

            {isLoggedIn ? (
              <ul className="w-[80%] flex flex-col items-center justify-around align-middle h-[80%]">
                {MENULOGIN.map((data, index) => {
                  return <MobileItems key={index} item={data} />;
                })}
              </ul>
            ) : (
              <ul className="w-[80%] flex flex-col items-center justify-around align-middle h-[80%]">
                {MENUDATA.map((data, index) => {
                  return <MobileItems key={index} item={data} />;
                })}
              </ul>
            )}

            {isLoggedIn ? (
              <div className="h-max w-[80%] flex items-center justify-center  mb-[0%] select-none">
                <div className="flex flex-col w-full items-center space-y-3">
                  <MobileButton
                  disabled={mutation.isPending ? true : false}
                  onClick={() => mutation.mutate(
                    currentUserData && currentUserData?.id ? currentUserData?.id : null
                  )}
                    as={"button"}
                    className="rounded-full w-full max-w-[300px] py-4 font-[Sans-Bold] text-md"
                  >
                    {
                      mutation.isPending ? (<span>signing out...</span>)
                      : (
                        <span>Sign Out</span>
                      )
                    }
                    
                  </MobileButton>
                </div>
              </div>
            ) : (
              <div className="h-max w-[80%] flex items-center justify-center  mb-[0%] select-none">
                <div className="flex flex-col w-full items-center space-y-3">
                  <Button className="rounded-full w-full max-w-[300px] py-3 ">
                    <Typography className="font-[Sans-Bold] text-md">
                      Contact us
                    </Typography>
                  </Button>
                  <MobileButton
                    as={"button"}
                    className="rounded-full w-full max-w-[300px] py-4 font-[Sans-Bold] text-md"
                  >
                    <span>Sign In</span>
                  </MobileButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </CustomStack>
    </NavContainer>
  );
};

export default WebNavigation;

const NavContainer = styled(CustomStack)``;

const ActionButton = styled.div`
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  display: inline-block;
  position: relative;
  overflow: hidden;

  border-radius: 100px;
  border: 1px solid #fffffe;
  height: 40px;
  width: 140px;
  cursor: pointer;
  background: transparent;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);

  transition: all 0.3s ease;

  &:focus {
    outline: none;
  }

  span {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    transform: translateY(-50%);
    z-index: 9;
  }

  &:hover {
    background: transparent;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
`;

const MobileButton = styled.div`
  display: inline-block;
  position: relative;
  overflow: hidden;

  border-radius: 100px;
  border: 1px solid #fffffe;
  height: 40px;

  color: #ffffff;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  background: transparent;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  transition: all 0.3s ease;

  &:focus {
    outline: none;
  }

  span {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    transform: translateY(-50%);
    z-index: 9;
  }

  &:hover {
    background: transparent;
    background: #ee5170;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
`;
