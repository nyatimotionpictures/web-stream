import { Stack, Typography } from "@mui/material";
import { formatDuration, intervalToDuration, isBefore } from "date-fns";
import React from "react";
import { queryClient } from "../../../../lib/tanstack";
import { useParams } from "react-router-dom";

const GetRemainingDays = ({ expiryDate }) => {
  let params = useParams();
  const [days, setDays] = React.useState(0);
  let getRemainingDays = () => {
    let currentDate = new Date();

    if (isBefore(new Date(expiryDate), currentDate)) {
      return "0 days 0 hours 0 minutes";
    }

    const duration = intervalToDuration({
      start: currentDate,
      end: new Date(expiryDate),
    });

    return formatDuration(duration, {
      format: ["days", "hours", "minutes", "seconds"],
    });
  };

  const updateRemainingTime = async () => {
    const timeLeft = getRemainingDays();
    setDays(timeLeft);

    if (timeLeft === "0 days 0 hours 0 minutes") {
      await queryClient.invalidateQueries({ queryKey: ["film", params?.id] });
      await queryClient.invalidateQueries({ queryKey: ["season", params?.id] });
    }
  };

  React.useEffect(() => {
    updateRemainingTime();
    // Recalculate every minute
    const interval = setInterval(updateRemainingTime, 6000); // 1-minute interval

    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <Stack direction="row" className="gap-2">
      <Typography className="font-[Inter-Regular] text-[#FFFAF6] text-sm md:text-base">
        Rented Days Left: {days}
      </Typography>
    </Stack>
  );
};

export default GetRemainingDays;
