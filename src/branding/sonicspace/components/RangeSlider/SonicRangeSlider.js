import React from "react";
import Rheostat from "rheostat";
import "./SonicRangeSlider.css";

const SonicRangeSlider = ({ min, max, disabled = false, ...props }) => {
  return (
    <div
      className={`sonic-rangeslider-wrapper ${
        disabled ? "sonic-rangeslider-wrapper-disabled" : ""
      }`}
    >
      <Rheostat
        className="sonic-rangeslider"
        min={min}
        max={max}
        disabled={disabled}
        {...props}
      />
      <div className="sonic-rangeslider-numbers">
        <div>{min}</div>
        <div>{max}</div>
      </div>
    </div>
  );
};

export default SonicRangeSlider;
