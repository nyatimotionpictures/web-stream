import React, { useContext } from "react";

import { Stack, Typography } from "@mui/material";

import UViewTabs from "./UViewTabs";
import STopbar from "../../../2-Components/Navigation/STopbar";
import Sidebar from "../../../2-Components/Navigation/Sidebar";
import { AuthContext } from "../../../5-Store/AuthContext";
import { useGetWatchList } from "../../../5-Store/TanstackStore/services/queries";

const UViewActivity = () => {
  const userData = useContext(AuthContext);
  const watchedQuery = useGetWatchList(userData?.currentUser?.user?.id);

  let watchlistData = React.useMemo(() => {
    return watchedQuery?.data?.watchlist?.SAVED?.filter((film) => {
      return film;
    });
  }, [watchedQuery?.data]);
  return (
    <Stack
      spacing={"0"}
      className="max-h-screen h-[100vh] w-full flex flex-col bg-whites-900 relative"
    >
      <STopbar />
      <div className="md:grid md:grid-cols-[auto,1fr] flex-grow-1 relative h-screen overflow-x-hidden overflow-y-auto">
        <Sidebar />

        <div className="bg-secondary-700 h-screen md:h-full px-4 md:px-[38px] pt-[14px] md:pb-[40px]">
          <UViewTabs watchlistData={watchlistData} />
        </div>
      </div>
    </Stack>
  );
};

export default UViewActivity;
