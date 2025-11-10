import React from "react";
import { WppSlider } from "@wppopen/components-library-react";
import "./WPPRangeSlider.css";

const WPPRangeSlider = ({ min, max, values, onChange, ...props }) => {
  const handleRangeSliderChange = (event) => {
    let sliderMeta = { max, min, values: event.detail.value };
    onChange(sliderMeta);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <WppSlider
          type="range"
          className="wpp-rangeslider"
          value={values}
          min={min}
          max={max}
          onWppChange={handleRangeSliderChange}
        />
        <div className="wpp-rangeslider-numbers">
          <div>{min}</div>
          <div>{max}</div>
        </div>
      </div>
    </div>
  );
};

export default WPPRangeSlider;
