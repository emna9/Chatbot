// components/Loader.tsx
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="loader__circle" />
        <div className="loader__circle" />
        <div className="loader__circle" />
        <div className="loader__circle" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .loader__circle {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #d3d3d3;
    animation: loader_901 1s ease-in-out infinite;
  }

  .loader__circle:nth-of-type(1) {
    animation-delay: 0s;
  }

  .loader__circle:nth-of-type(2) {
    animation-delay: 0.2s;
  }

  .loader__circle:nth-of-type(3) {
    animation-delay: 0.4s;
  }

  .loader__circle:nth-of-type(4) {
    animation-delay: 0.6s;
  }

  @keyframes loader_901 {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
  }
`;

export default Loader;
