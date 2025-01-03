import React from "react";
import CustomStack from "../../../2-Components/Stacks/CustomStack";
import Footer from "../../../2-Components/Footer/Footer";
import styled from "styled-components";
import UserHero from "./UserHero";
import UserCategory from "./UserCategory";
import WebNavigation from "../../../2-Components/Navigation/WebNavigation";
import { useGetAllFilms } from "../../../5-Store/TanstackStore/services/queries";
import useEmblaCarousel from "embla-carousel-react";
import FilmJSON from '../../../1-Assets/data/film_metadata.json'
import "./slider.css"
import Autoplay from 'embla-carousel-autoplay';


const UserHome = () => {
  const autoplayOptions = { delay: 10000 };
  const autoplay = Autoplay(autoplayOptions);
  const [featuredFilms, setFeaturedFilms] = React.useState([FilmJSON[0], FilmJSON[1]])
  let filmsQuery = useGetAllFilms();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    draggable: true,
    align: "start",
    startIndex: 0,
    snapSize: 1,
    gap: 0,
  },[autoplay]);

  const FeaturedData = React.useMemo(() => {
    return filmsQuery?.data?.films?.filter((film) => {
      if (film.type === "movie") {
        return film;
      } else if (film.type === "series") {
        return film;
      }
    });
  }, [filmsQuery?.data?.films]);

 // console.log("featuredFilkms", FilmJSON)

  let Categories = []



  console.log(filmsQuery?.data?.films);
  return (
    <Container className="space-y-0 flex-col relative w-full h-full overflow-x-hidden">
      <WebNavigation isLoggedIn={true} />
      <CustomStack className="flex-col w-full h-full">
        {/** carousel */}
        <div className="embla !min-h-[70vh] ">
          <div className="embla__viewport !overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex flex-row !space-x-0 !gap-0 px-0 pr-0">
              {FeaturedData?.map((data, index) => {
                return (
                  <div key={index} className="embla__slide space-x-0 ">
                    <UserHero filmData={data} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

{
  Categories?.length > 0 && (
    <UserCategory />
  )
}
       
      </CustomStack>

      <Footer />
    </Container>
  );
};

export default UserHome;

const Container = styled(CustomStack)``;
