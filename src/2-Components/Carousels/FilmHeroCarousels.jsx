import React, { useState } from 'react'
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import websiteJSON from '../../1-Assets/data/web_metadata.json'
import { DotButton, useDotButton } from "./HCarouselDotButton";
import './FHCarousel.css'

const TWEEN_FACTOR_BASE = 0.84;

const numberWithinRange = (number, min, max) =>
    Math.min(Math.max(number, min), max);

const FilmHeroCarousels = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
    const [ImageSlides, setImageSlides] = React.useState([]);
    const tweenFactor = React.useRef(0);


    const { selectedIndex, scrollSnaps, onDotButtonClick } =
        useDotButton(emblaApi);


    const setTweenFactor = React.useCallback((emblaApi) => {
        tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
    }, []);

    const tweenOpacity = React.useCallback((emblaApi, eventName) => {
        const engine = emblaApi.internalEngine();
        const scrollProgress = emblaApi.scrollProgress();
        const slidesInView = emblaApi.slidesInView();
        const isScrollEvent = eventName === "scroll";

        emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
            let diffToTarget = scrollSnap - scrollProgress;
            const slidesInSnap = engine.slideRegistry[snapIndex];

            slidesInSnap.forEach((slideIndex) => {
                if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

                if (engine.options.loop) {
                    engine.slideLooper.loopPoints.forEach((loopItem) => {
                        const target = loopItem.target();

                        if (slideIndex === loopItem.index && target !== 0) {
                            const sign = Math.sign(target);

                            if (sign === -1) {
                                diffToTarget = scrollSnap - (1 + scrollProgress);
                            }
                            if (sign === 1) {
                                diffToTarget = scrollSnap + (1 - scrollProgress);
                            }
                        }
                    });
                }

                const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
                const opacity = numberWithinRange(tweenValue, 0, 1).toString();
                emblaApi.slideNodes()[slideIndex].style.opacity = opacity;
            });
        });
    }, []);

    React.useEffect(() => {
        if (!emblaApi) return;

        setTweenFactor(emblaApi);
        tweenOpacity(emblaApi);
        emblaApi
            .on("reInit", setTweenFactor)
            .on("reInit", tweenOpacity)
            .on("scroll", tweenOpacity);

        return () => { };
    }, [emblaApi, tweenOpacity]);

    //get image content
    React.useEffect(() => {
        const findWebData = websiteJSON.find(
            (data) => data.directory === "/website-metadata/FilmsPage"
        );
        //console.log("meta", findWebData);
        //setImageSlides;
        if (findWebData) {
            const mappedImages = findWebData.content[0].files.map((images) => {
                let saveObject = {
                    webImage: "",
                    mobileImage: ""
                }
                 images.imgs.map((datas) => {
                    if (datas.type === "Web") {
                        saveObject.webImage = datas.link
                    } else {
                        saveObject.mobileImage = datas.link
                    }
                })

                return saveObject;

            });

            setImageSlides(() => mappedImages);
        }
    }, []);

    return (
        <div className="embla">
            <div className="embla__viewport !h-[300px] relative" ref={emblaRef}>
                <div className="embla__container h-[300px]">
                    {ImageSlides.map((data, index) => {
                        return (
                            <div className="embla__slide " key={index}>
                                <img
                                    className="embla__slide__img object-cover h-[300px] shrink-0 object-center sm:!object-contain lg:object-cover hidden sm:flex"
                                    src={data.webImage}
                                    alt=""
                                />
                                <img
                                    className="embla__slide__img object-cover h-[300px] shrink-0 object-center lg:object-cover sm:hidden"
                                    src={data.mobileImage}
                                    alt=""
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="embla__controls absolute  flex w-full overflow-hidden right-0 justify-center bottom-5 sm:bottom-14 md:bottom-5 items-center lg:bottom-3 ">
                    <div className="embla__dots">
                        {scrollSnaps.map((_, index) => (
                            <DotButton
                                key={index}
                                onClick={() => onDotButtonClick(index)}
                                className={"embla__dot".concat(
                                    index === selectedIndex ? " embla__dot--selected" : ""
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilmHeroCarousels