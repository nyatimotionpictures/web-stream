import React, { ElementType, ReactNode, useContext } from "react";
import Button, { buttonStyles } from "../Buttons/Button.tsx";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "../../5-Store/SidebarContext.tsx";
import {  Typography } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../5-Store/AuthContext.jsx";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { postAuthLogout } from "../../5-Store/TanstackStore/services/api.ts";

{
  /** small sidebar --- starts here */
}
type SmallSidebarItemProps = {
  Icon: string;
  title: string;
  url: string;
};

[
  /** items - smallbarItems */
];
const SmallSidebarItem = ({ Icon, title, url }: SmallSidebarItemProps) => {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        twMerge(
          buttonStyles({ variant: "ghost" }),
          `py-4 px-4 md:px-1 flex md:flex-col items-center text-whites-500 rounded-lg gap-1 ${
            isActive
              ? "font-bold bg-tertiary-40 hover:bg-tertiary-40 text-primary-500"
              : undefined
          }`
        )
      }
    >
      <span className={`${Icon} w-6 h-6 `} />
      <div className="text-sm md:text-xs">{title}</div>
    </NavLink>
  );
};

type LargeSidebarSectionProps = {
  children: ReactNode;
  title?: string;

  visibleItemCount?: number;
};

[
  /** items - smallbarItems */
];

const LargeSidebarSection = ({
  children,
  title,
  visibleItemCount = Number.POSITIVE_INFINITY,
}: LargeSidebarSectionProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const childrenArray = React.Children.toArray(children).flat();
  const showExpandButton = childrenArray.length > visibleItemCount;
  const visibleChildren = isExpanded
    ? childrenArray
    : childrenArray.slice(0, visibleItemCount);

  const ButtonIcon = isExpanded
    ? "icon-[solar--alt-arrow-up-broken]"
    : "icon-[solar--alt-arrow-down-broken]";

  return (
    <div className="flex flex-col gap-3 flex-1">
      {title && <div className="ml-4 mt-2 text-lg mb-1">{title}</div>}
      {visibleChildren}
      {showExpandButton && (
        <Button
          onClick={() => setIsExpanded((e) => !e)}
          variant="ghost"
          className="w-full flex items-center rounded-lg gap-4 p-3"
        >
          <span className={`${ButtonIcon} w-6 h-6 text-whites-200`} />
          <div>{isExpanded ? "Show Less" : "Show More"}</div>
        </Button>
      )}
    </div>
  );
};

[
  /** items - LargebarItems */
];
type LargeSidebarItemProps = {
  Icon: ElementType | string;
  title: string;
  url: string;
  isActive?: boolean;
};

const LargeSidebarItem = ({ Icon, title, url }: LargeSidebarItemProps) => {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        twMerge(
          buttonStyles({ variant: "ghost" }),
          `w-full flex items-center rounded-lg gap-4 p-3 text-whites-200 hover:text-primary-500 hover:font-bold hover:bg-tertiary-40 ${
            isActive
              ? "font-bold bg-tertiary-40 hover:bg-tertiary-40 text-primary-500"
              : undefined
          }`
        )
      }
    >
      <span className={`${Icon} w-6 h-6  hover:text-primary-500 `} />
      <div className="whitespace-nowrap  overflow-hidden text-ellipsis hover:text-primary-500 ">
        {title}
      </div>
    </NavLink>
  );
};

const Sidebar = () => {
  let navigate = useNavigate();
 
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();
  const userData = useContext(AuthContext);
  const [currentUserData, setCurrentUserData] = React.useState(null);
  const queryClient = new QueryClient();
  React.useEffect(() => {
    if (userData.currentUser !== null) {
      setCurrentUserData(userData.currentUser?.user);
    } else {
      navigate("/login", { replace: true });
    }
   // console.log("userData", userData);
  
  }, [userData.currentUser?.user.id]);

  const mutation = useMutation({
    mutationFn: postAuthLogout,
    onSuccess: (data) => {
      queryClient.clear();
      localStorage.clear();
      //localStorage.removeItem("user");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      // setErroressage(()=> `Login Failed: ${error.message}`)
    },
  });
  return (
    <>
      <aside
        className={`md:sticky top-0 overflow-y-auto scrollbar-hidden pb-4 flex flex-col ml-0 bg-secondary-800 h-max md:h-full ${
          isLargeOpen ? "lg:hidden" : "lg:flex"
        }`}
      >
        <div className=" pt-2 pb-4 px-2 sticky top-0 bg-white">
              
              <div onClick={()=> navigate("/", { replace: true })} className="flex flex-row text-whites-40 items-center space-x-2 h-10 select-none hover:text-primary-500">
                <span className="icon-[solar--arrow-left-linear] h-6 w-6"></span>
                <Typography className="whitespace-nowrap  overflow-hidden text-ellipsis text-sm  font-[Inter-Regular]">
                  Back 
                </Typography>
              </div>
            </div>
            <div className="flex flex-row md:flex-col md:gap-5 w-full items-center justify-center">
            <SmallSidebarItem
          Icon={"icon-[solar--home-linear]"}
          title={"Your Account"}
          url={"/account"}
        />
        <SmallSidebarItem
          Icon={"icon-[solar--chart-2-linear]"}
          title="Viewing Activity"
          url="/settings/activity"
        />

            </div>
     
       
       

       
      </aside>

      {isSmallOpen && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0 z-[999] bg-secondary-600 opacity-50"
        />
      )}
      <aside
        className={`w-56 lg:sticky absolute  top-0  overflow-x-hidden overflow-y-auto scrollbar-hidden pb-4 flex-col gap-2 px-2 bg-secondary-800 h-full  ${
          isLargeOpen ? "lg:flex" : "lg:hidden"
        } ${isSmallOpen ? "flex z-[999] bg-white max-h-screen" : "hidden"}`}
      >
           <div className=" pt-2 pb-4 px-2 sticky top-0 bg-white">
            
              <div onClick={()=> navigate("/", {replace: true})} className="flex flex-row text-whites-40 items-center space-x-2 h-10 select-none hover:text-primary-500">
                <span className="icon-[solar--arrow-left-linear] h-6 w-6"></span>
                <Typography className="whitespace-nowrap  overflow-hidden text-ellipsis  font-[Inter-Regular]">
                  Back to Nyati Films
                </Typography>
              </div>
            </div>
        <LargeSidebarSection>
          <LargeSidebarItem
            Icon={"icon-[solar--home-linear]"}
            title={"Your Account"}
            url={"/account"}
          />
          <LargeSidebarItem
            Icon={"icon-[solar--chart-2-linear]"}
            title={"Viewing Activity"}
            url={"/settings/activity"}
          />
         
          
        </LargeSidebarSection>

      </aside>
    </>
  );
};

export default Sidebar;
