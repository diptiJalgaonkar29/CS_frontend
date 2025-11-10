import React from "react";
import "./CustomRangeSlider.css";
import Reset from "../../../static/voice/restart.svg";

const CustomRangeSlider = ({
  min = 0,
  max = 3,
  step = 1,
  defaultValue = 0,
  value,
  datalist = [
    // { value: 0, label: "0" },
    // { value: 1, label: "1" },
    // { value: 2, label: "2" },
    // { value: 3, label: "3" },
  ],
  onChangeValue = () => {},
}) => {
  return (
    <>
      <input
        type="range"
        max={max}
        min={min}
        step={step}
        list="tickmarks"
        id="range_slider"
        style={{ cursor: "pointer" }}
        value={+value}
        onChange={(e) => {
          onChangeValue(e.target.value);
        }}
      />

      <datalist id="tickmarks" className="tickmarks">
        {datalist.map((data, i) => (
          <option
            key={"tickmarks" + data.label + i}
            value={data.value}
            label={data.label}
          />
        ))}
      </datalist>
      <div
        className="reset_container"
        onClick={() => {
          onChangeValue(defaultValue);
        }}
      >
        <img src={Reset} alt="Reset" />
        <p className="reset_text">Reset</p>
      </div>
    </>
  );
};

export default CustomRangeSlider;
