import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css';

const ImageLoad = ({imageData}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <LazyLoadImage
    alt={imageData?.alt ?? ""}
    placeholderSrc={""}
    src={imageData?.src}
    effect={isLoaded ? "" : "blur"}
    className={imageData?.className ? `${imageData?.className} ${isLoaded ? "opacity-100" : "opacity-0"}` : ""}
    onLoad={() => setIsLoaded(true)}
    wrapperProps={{
        // If you need to, you can tweak the effect transition using the wrapper style.
        style: {transitionDelay: "1s"},
    }}
    />
  )
}

export default ImageLoad