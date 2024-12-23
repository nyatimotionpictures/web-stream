import React from 'react'

import styled from 'styled-components';

const CustomLoader = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-secondary-800 absolute top-0 left-0 bg-opacity-70 text-red-500">
      <LoaderContainer>
        <div className="loader"></div>
      </LoaderContainer>
    </div>
  );
}

export default CustomLoader

const LoaderContainer = styled.div`
  .loader {
    font-size: 10px;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    position: relative;
    text-indent: -9999em;
    animation: mulShdSpin 1.1s infinite ease;
    transform: translateZ(0);
  }
  @keyframes mulShdSpin {
    0%,
    100% {
      box-shadow: 0em -2.6em 0em 0em #ee5170,
        1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
        2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
        0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
        -2.6em 0em 0 0em rgba(238, 81, 112, 0.5),
        -1.8em -1.8em 0 0em rgba(238, 81, 112, 0.7);
    }
    12.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(238, 81, 112, 0.7),
        1.8em -1.8em 0 0em #ee5170, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
        0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
        -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0em rgba(238, 81, 112, 0.5);
    }
    25% {
      box-shadow: 0em -2.6em 0em 0em rgba(238, 81, 112, 0.5),
        1.8em -1.8em 0 0em rgba(238, 81, 112, 0.7), 2.5em 0em 0 0em #ee5170,
        1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
        0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
        -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);
    }
    37.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0em rgba(238, 81, 112, 0.5),
        2.5em 0em 0 0em rgba(238, 81, 112, 0.7), 1.75em 1.75em 0 0em #ee5170,
        0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
        -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);
    }
    50% {
      box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
        2.5em 0em 0 0em rgba(238, 81, 112, 0.5),
        1.75em 1.75em 0 0em rgba(238, 81, 112, 0.7), 0em 2.5em 0 0em #ee5170,
        -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
        -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);
    }
    62.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
        2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0em rgba(238, 81, 112, 0.5),
        0em 2.5em 0 0em rgba(238, 81, 112, 0.7), -1.8em 1.8em 0 0em #ee5170,
        -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);
    }
    75% {
      box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
        2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
        0em 2.5em 0 0em rgba(238, 81, 112, 0.5),
        -1.8em 1.8em 0 0em rgba(238, 81, 112, 0.7), -2.6em 0em 0 0em #ee5170,
        -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);
    }
    87.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2),
        1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
        2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
        1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
        0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
        -1.8em 1.8em 0 0em rgba(238, 81, 112, 0.5),
        -2.6em 0em 0 0em rgba(238, 81, 112, 0.7),
        -1.8em -1.8em 0 0em rgb(238, 81, 112);
    }
  }
`;