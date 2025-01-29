import React from "react";
import Button from "../../../2-Components/Buttons/Button";
import { Slider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";

const DonationFilmCard = ({filmData}) => {
   const [posterlink, setPosterLink] = React.useState("");
    let navigate = useNavigate();

    let currentDate = moment(new Date());
    console.log("currentDate", currentDate);
    
    let startDate = moment(filmData?.releaseDate);
    let endDate = moment(filmData?.donationDeadline);
    let pastPostDate = moment.duration(currentDate.diff(startDate)).asDays();

    let Pastduration = pastPostDate > 0 ? pastPostDate : 0;
    let duration = moment.duration(endDate.diff(currentDate)).asDays();

    const shuffleArray = (array) => {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
          const endItems = Math.floor(Math.random() * (i + 1));
          [shuffledArray[i], shuffledArray[endItems]] = [
              shuffledArray[endItems],
              shuffledArray[i],
          ];
      }
      return shuffledArray;
  };

     React.useEffect(() => {
       if (filmData?.posters?.length > 0 && filmData?.posters?.length > 1) {
         let filteredPosters = filmData?.posters?.filter((data) => {
           if (data.isCover) {
             return data;
           }
         });
         if(filteredPosters.length > 0){
          const shuffledItems = shuffleArray(filteredPosters);
         let selectedlink = shuffledItems[0];

         setPosterLink(selectedlink);
         } else {
          const shuffledItems = shuffleArray(filmData?.posters);
         let selectedlink = shuffledItems[0];

         setPosterLink(selectedlink);
         }
         
         
       } else if (filmData?.posters?.length > 0 && filmData?.posters?.length === 1) {
         let selectedlink = filmData.posters[0];
         setPosterLink(selectedlink);
       } else {
         setPosterLink(() => filmData?.poster ?? "");
       }
     }, [filmData]);


    // console.log("filmData", filmData);
  return (
    <div className="flex flex-col  w-[260px] h-[390px] rounded-lg border border-[#BAC0CA] border-opacity-40 overflow-hidden">
      <div className="flex object-cover !h-[150px] bg-secondary-100 w-full">
        <img src={posterlink.url} alt="film card" />
      </div>
      <div className="p-4 flex flex-col bg-[#141118] flex-1 justify-between">
        <div className="flex flex-col gap-2 border-b border-b-[#F2F2F2] pb-2">
          <h1 className="text-[#F2F2F2] w-full font-[Inter-Bold]  text-base ">
            {
              filmData?.title
            }
          </h1>

          <p className="text-[#F2F2F2] text-opacity-60 w-full font-[Inter-Medium]  text-xs ">
           {Pastduration ? parseInt(Pastduration) : null} day(s) ago
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/** slider */}
          <div>
            <div className="flex flex-row w-full items-center justify-between">
              {/** current price */}
              <p className="text-[#F8B5C3] text-xs uppercase">0 UGX</p>
              {/** expected price */}
              <p className="text-[#FFFAF6] text-xs font-[Inter-Medium]">
                {" "}
                {filmData?.donationTargetAmount?.toLocaleString()}
              </p>
            </div>
            <div className="flex w-full text-whites-40">
              <Slider
              value={0}
                min={0}
                
                max={filmData?.donationTargetAmount ?? 0}
                sx={{
                  "& .MuiSlider-thumb": {
                    color: "#fff",
                    display: "none",
                  },
                  "& .MuiSlider-track": {
                    color: "red",
                  },
                  "& .MuiSlider-rail": {
                    color: "rgba(255,255,255,0.4)",
                  },
                }}
                step={0.1}
              />
            </div>

            <div className="flex flex-row w-full items-center justify-between">
              {/** current price */}
              {/* <p className=" text-xs text-[#EE5170]">
                10 <span className="text-whites-40">Donators</span>
              </p> */}
              {/** expected price */}
              <p className=" text-xs text-[#EE5170]">
                {duration ? parseInt(duration) : null} <span className="text-whites-40">Days left</span>
              </p>
            </div>
          </div>

          {/** button */}
          <div onClick={()=> navigate(`/donate/${filmData?.id}`)} className="w-full items-center flex justify-center">
            <Button className="flex w-full rounded-full items-center justify-center">
              View More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationFilmCard;
