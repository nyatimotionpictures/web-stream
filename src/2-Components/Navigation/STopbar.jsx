import React from 'react'
import Logo from '../../1-Assets/logos/Logo.svg'
import { Avatar } from '@mui/material';
// import { Avatar, Wrap, WrapItem } from "@chakra-ui/react";
const STopbar = () => {
  return (
    <div className="sticky w-screen flex flex-row min-h-[64px] py-2 px-7 items-center justify-between bg-secondary-900">
      <div className="w-14 h-14">
        <img src={Logo} alt="Nyati Logo" className=" object-contain" />
      </div>

      <div>
        <div>
          <Avatar
            name="Joshua Kimbareeba"
            src=""
            className="bg-primary-500 rounded-full p-3 w-12 h-12 font-[Inter-Bold] select-none cursor-pointer"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}

export default STopbar