import React from 'react'

const ContentProd = ({film}) => {
  console.log(film)
  return (
    <div className="bg-secondary-800  flex flex-col items-center justify-center px-[30px] py-[54px] sm:px-16 md:px-16 lg:px-16 sm:py-16 w-screen overflow-hidden">
          <div className="flex flex-col gap-10 items-center text-center justify-center md:items-start md:flex-row lg:text-left lg:items-start xl:flex-row lg:justify-between w-full lg:max-w-[1000px] ">
        {/** text portion */}
        <div className="flex flex-col gap-[20px] lg:max-w-[570px]">
          {/** overview */}
          <div className="flex flex-col gap-[12px]">
            <div className="font-[Inter-SemiBold] text-[18px] text-left sm:text-xl lg:text-2xl text-whites-50 font-semibold">
              Overview
            </div>
            <div className="font-[Inter-Regular] font-normal text-base text-left  lg:text-justify 2xl:text-lg text-whites-50 opacity-45 ">
              {film?.overview}
            </div>
          </div>
          {/** directors */}
          {
            film?.directors?.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-[Inter-SemiBold] text-[18px] text-left sm:text-xl lg:text-2xl text-whites-50 font-semibold">
                  Directors
                </div>
                <div className="font-[Inter-Regular] font-normal text-base text-left lg:text-justify 2xl:text-lg text-whites-50 opacity-45 ">
                  {film?.directors?.map((data, index) => {
                    return (
                      <span key={index}>
                        {(index ? ", " : "") + data}
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          }
          {/** Producers */}
          {
            film?.producers?.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-[Inter-SemiBold] text-[18px] text-left sm:text-xl lg:text-2xl text-whites-50 font-semibold">
                  Producers
                </div>
                <div className="font-[Inter-Regular] font-normal text-base text-left lg:text-justify 2xl:text-lg text-whites-50 opacity-45 ">
                  {film?.producers?.map((data, index) => {
                    return (
                      <span key={index}>
                        {(index ? ", " : "") + data}
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          }
          {/** Writers */}

          {
            film?.writers?.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-[Inter-SemiBold] text-[18px] text-left sm:text-xl lg:text-2xl text-whites-50 font-semibold">
                  Writers
                </div>
                <div className="font-[Inter-Regular] font-normal text-base text-left lg:text-justify 2xl:text-lg text-whites-50 opacity-45 ">
                  {film?.writers?.map((data, index) => {
                    return (
                      <span key={index}>
                        {(index ? ", " : "") + data}
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          }
        </div>

        
      </div>
    </div>
  )
}

export default ContentProd