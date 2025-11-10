import React from "react";
import { WppSlider } from "@wppopen/components-library-react";
import "./WPPSliderInput.css";

const WPPSliderInput = ({ className = "", onChange, ...props }) => {
  const handleRangeSliderChange = (event) => {
    onChange(event.detail.value);
  };

  return (
    <WppSlider
      type="single"
      className={`WppSliderInput ${className}`}
      {...props}
      onWppChange={handleRangeSliderChange}
    />
  );
};

export default WPPSliderInput;
