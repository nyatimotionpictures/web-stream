import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import Dropdown from "./Dropdown";

const MenuItems = ({ item }) => {
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

  const onMouseClick = () => {
    setDropDown(true);
  };
  return (
    <MenuItemWrap
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onMouseClick}
    >
      {item?.subData ? (
        <>
          <NavLink
            role="button"
            className={({ isActive }) =>
              isActive && location.pathname.includes(item.path)
                ? "flex items-center text-whites-40 px-4 py-3 xl:px-6 xl:py-4 border-b-2 border-b-primary-500 font-[Inter-SemiBold] text-sm lg:text-base xl:text-base  capitalize"
                : "flex items-center text-whites-40 px-4 py-3 xl:px-6 xl:py-4 border-b-2 border-b-transparent font-[Inter-Regular] text-sm lg:text-base xl:text-base hover:border-b-primary-500 capitalize"
            }
            aria-haspopup="menu"
            aria-expanded={dropDown ? "true" : "false"}
            onClick={() => setDropDown((prev) => !prev)}
          >
            {item.title}

            <span className="icon-[bx--chevron-down] h-5 w-5 text-inherit"></span>
          </NavLink>

          <Dropdown submenus={item.subData} dropdown={dropDown} />
        </>
      ) : (
        <NavLink
          to={item.path}
          end={item.path === "/" ? true : false}
          className={({ isActive }) =>
            isActive
              ? "flex items-center text-whites-40 px-4 py-3 xl:px-6 xl:py-4 border-b-2 border-b-primary-500 font-[Inter-SemiBold] text-sm lg:text-base xl:text-base capitalize"
              : "flex items-center text-whites-40 px-4 py-3 xl:px-6 xl:py-4 border-b-2 border-b-transparent font-[Inter-Regular] text-sm lg:text-base xl:text-base hover:border-b-primary-500 capitalize"
          }
        >
          {item.title}
        </NavLink>
      )}
    </MenuItemWrap>
  );
};

export default MenuItems;

const MenuItemWrap = styled.li`
  text-decoration: none;
`;
