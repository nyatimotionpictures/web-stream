import React from 'react'
import Content from '../../../1-Assets/Hero.png'

const HeroProd = ({film}) => {
   const [posterlink, setPosterLink] = React.useState("");
  console.log("film", film);

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
       if (film?.posters?.length > 0 && film?.posters?.length > 1) {
         let filteredPosters = film?.posters?.filter((data) => {
           if (!data.isCover) {
             return data;
           }
         });
         if(filteredPosters.length > 0){
          const shuffledItems = shuffleArray(filteredPosters);
         let selectedlink = shuffledItems[0];

         setPosterLink(selectedlink);
         } else {
          const shuffledItems = shuffleArray(filteredPosters);
         let selectedlink = shuffledItems[0];

         setPosterLink(selectedlink);
         }
         
         
       } else if (film?.posters?.length > 0 && film?.posters?.length === 1) {
         let selectedlink = film.posters[0];
         setPosterLink(selectedlink);
       } else {
         setPosterLink(() => film?.poster ?? "");
       }
     }, [film]);

  return (
    <div
      className={`flex flex-col h-[50vh]  md:h-[70vh] w-screen bg-cover bg-no-repeat bg-fixed relative items-center md:items-center  justify-center overflow-hidden`}
    >
      <img
        src={posterlink.url}
        alt=""
       className="flex absolute top-0 object-cover h-full w-full select-none bg-gradient-to-b from-transparent to-secondary-700"
        style={{
          filter: "brightness(20%)", // Adjust brightness if needed
        }}
      />
      <div className="flex flex-col h-full w-full relative items-center md:items-start justify-end overflow-hidden  bg-gradient-to-b from-transparent to-secondary-800">
        <div className="flex flex-col text-left px-5 pb-[5%] sm:px-16 md:px-16 xl:mx-0 xl:px-16  gap-[14px] md:gap-[24px] lg:gap-[61px]   md:max-w-[586px] xl:max-w-[520.89px]   xl:text-left z-40 text-[#ffffff]">
          <div className="flex flex-col gap-[10px] md:gap-[21px]">
            <p className=" text-center md:text-left font-[Inter-Bold] text-[24px] md:text-5xl text-whites-40 select-none">
              {film?.title}
            </p>
            <p className="font-Regular font-[Inter-Regular] text-sm text-center  sm:text-base md:text-lg xl:text-lg md:text-left xl:leading-normal text-[#EEF1F4]">
              {film?.plotSummary}
            </p>
            <p className="font-extrabold font-[Inter-Regular] text-xs text-center sm:text-base md:text-lg xl:text-lg md:text-left xl:leading-normal text-[#EEF1F4]">
            Production Stage: Pre-production
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroProd