import { Typography } from "@mui/material";
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
const Dropdown = ({ submenus, dropdown }) => {
  return (
    <SubMenuWrap
      className={`absolute h-max overflow-hidden rounded-lg bg-secondary-900 w-max shadow-lg  ${
        dropdown ? "flex flex-col z-50" : "hidden"
      }`}
    >
      {submenus.map((data, index) => {
        return (
          <li key={index} className="h-[40px] w-full ">
            <NavLink
              role="button"
              to={data.url}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-6 h-full w-full bg-primary-100 font-[Inter-SemiBold] text-sm capitalize lg:text-base"
                  : "flex items-center px-6 h-full w-full border-b-2 border-b-transparent font-[Inter-Regular] text-sm lg:text-base hover:bg-secondary-200 capitalize text-whites-50"
              }
            >
              {data.title}
            </NavLink>
          </li>
        );
      })}
    </SubMenuWrap>
  );
};

export default Dropdown;

const SubMenuWrap = styled.ul`
z-index: 1;
`;
