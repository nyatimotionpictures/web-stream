import { Typography } from "@mui/material";
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const MobileDropdown = ({ submenus, dropdown }) => {
  return (
    <SubMenuWrap
      className={`h-max overflow-hidden rounded-lg bg-transparent w-full shadow-lg ${
        dropdown ? "flex flex-col" : "hidden"
      }`}
    >
      {submenus.map((data, index) => {
        return (
          <li key={index} className="w-full flex flex-col items-center">
            <div className="w-full">
              <NavLink
                role="button"
                to={data.url}
                className={({ isActive }) =>
                  isActive
                    ? "max-w-[300px] mx-auto py-4 flex items-center justify-center bg-[#36323E] rounded-sm font-[Inter-Bold] text-primary-500 text-xs capitalize"
                    : "max-w-[300px] mx-auto py-4 flex items-center justify-center   font-[Inter-SemiBold] rounded-sm text-whites-600 text-xs hover:bg-[#36323E] capitalize"
                }
              >
                {data.title}
              </NavLink>
            </div>
          </li>
        );
      })}
    </SubMenuWrap>
  );
};

export default MobileDropdown;

const SubMenuWrap = styled.ul``;
