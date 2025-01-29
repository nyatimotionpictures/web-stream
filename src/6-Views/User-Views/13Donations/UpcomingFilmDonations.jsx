import React from 'react'
import DonationFilmCard from './DonationFilmCard'

const UpcomingFilmDonations = ({films}) => {
  console.log("films", films);
  return (
    <>
    {
      films?.length > 0 && (
        <div className="min-h-[60vh] h-full lg:min-h-screen flex flex-col bg-[#17141B] items-center justify-center px-[30px] py-16 sm:px-16 md:py-16 lg:py-16 w-screen overflow-hidden relative">
        <div className='flex flex-col gap-4'>

            <h1 className="text-[#F2F2F2] w-full font-[Inter-Bold] text-center text-base md:text-xl lg:text-2xl">
                Featured Pre-production
            </h1>

            <div className='w-full flex-col flex-wrap gap-4'>
              {
                films?.map((film, index) => {
                  return (
                    <DonationFilmCard key={index} filmData={film} />
                  );
                })
              }
               

            </div>
        </div>
    </div>
      )
    }
    
    </>
   
  )
}

export default UpcomingFilmDonations