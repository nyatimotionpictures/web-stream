import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import MobileDropdown from "./MobileDropdown";

const MobileItems = ({ item }) => {
  const [dropDown, setDropDown] = React.useState(false);
  let ref = React.useRef();

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

  const onMouseEnter = () => {
    window.innerWidth > 960 && setDropDown(true);
  };

  const onMouseLeave = () => {
    window.innerWidth > 960 && setDropDown(false);
  };

    const onMouseClick = (event) => {
       if (dropDown && ref.current && !ref.current.contains(event.target)) {
         setDropDown(false);
       } else {
            setDropDown(!dropDown);
       }
   
  };
  return (
    <MenuItemWrap
      ref={ref}
      onClick={onMouseClick}
      className="flex flex-col w-full mx-auto align-middle"
    >
      {item?.subData ? (
        <div className="w-full">
          <NavLink
            role="button"
            className={({ isActive }) =>
              isActive && location.pathname.includes(item.url)
                ? "max-w-[300px] mx-auto py-4 gap-1 flex items-center justify-center bg-[#36323E] rounded-sm font-[Inter-Bold] text-primary-500 text-md capitalize"
                : "max-w-[300px] mx-auto py-4 gap-1 flex items-center justify-center   font-[Inter-SemiBold] rounded-sm text-whites-40 text-md hover:bg-[#36323E] capitalize"
            }
            aria-haspopup="menu"
            aria-expanded={dropDown ? "true" : "false"}
            onClick={() => setDropDown((prev) => !prev)}
          >
            {item.title}

            {dropDown ? (
              <span className="icon-[bx--chevron-up] h-5 w-5 text-inherit"></span>
            ) : (
              <span className="icon-[bx--chevron-down] h-5 w-5 text-inherit"></span>
            )}
          </NavLink>

          <MobileDropdown submenus={item.subData} dropdown={dropDown} />
        </div>
      ) : (
        <div>
          <NavLink
            to={item.path}
            end={item.path === "/" ? true : false}
            className={({ isActive }) =>
              isActive
                ? "max-w-[300px] mx-auto py-4 flex items-center justify-center bg-[#36323E] rounded-sm font-[Inter-Bold] text-primary-500 text-md capitalize"
                : "max-w-[300px] mx-auto py-4 flex items-center justify-center   font-[Inter-SemiBold] rounded-sm text-whites-40 text-md hover:bg-[#36323E] capitalize"
            }
          >
            {item.title}
          </NavLink>
        </div>
      )}
    </MenuItemWrap>
  );
};

export default MobileItems;

const MenuItemWrap = styled.li`
  text-decoration: none;
`;