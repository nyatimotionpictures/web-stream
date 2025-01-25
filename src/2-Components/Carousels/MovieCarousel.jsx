import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./MovieSlide.css";
//import { div, Stack } from "@chakra-ui/react";
import FilmJson from "../../1-Assets/data/film_metadata.json";
import MovieCard from "../Cards/MovieCard";
import MovieCard2 from "../Cards/MovieCard2";
import MovieCard1 from "../Cards/MovieCard1";
import MovieCard3 from "../Cards/MovieCard3";
import MovieCard4 from "../Cards/MovieCard4";
import MovieCard5 from "../Cards/MovieCard5";

const MovieCarousel = ({ displayData = [], cardtype }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, loop: true });
    const [allMovies, setAllMovies] = React.useState([]);
    const [viewportWidth, setViewportWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        // first
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    React.useEffect(() => {
      setAllMovies(() => FilmJson);
    }, [FilmJson]);

    // const breakpoints = {
    //     mobile: 480,
    //     tablet: 768,
    //     screen: 1028,
    // };

    // const config = {
    //     mobile: {
    //         slidesToScroll: 1,
    //         slidesToShow: 1,
    //     },
    //     tablet: {
    //         slidesToScroll: 2,
    //         slidesToShow: 2,
    //     },
    //     desktop: {
    //         slidesToScroll: 3,
    //         slidesToShow: 3,
    //     },
    // };

    //${cardtype === "genre" && "md:w-[420px]"

    return (
        <div className="emblaA w-full">
            <div className="embla__viewportA !w-full" ref={emblaRef}>
                <div className="embla__containerA flex  !items-start !justify-start gap-5  !w-full !pl-0 first:!ml-[-5rem] md:first:!ml-0">
                    {displayData.map((data, index) => {
                        return (
                            <div
                                key={index}
                                className={`embla__slideA h-full flex-none ${cardtype === "genre" && "md:w-[340px]"
                                    } ${cardtype === undefined && "md:w-[340px]"}`}
                            >
                                <div className="embla__slide__movie w-max gap-0">
                                    {cardtype === "genre" && <MovieCard5 data={data} />}
                                    {cardtype === undefined && <MovieCard1 data={data} />}
                                  

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MovieCarousel;
