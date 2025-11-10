import React from "react";
import "./SonicSliderInput.css";

const SonicSliderInput = ({
  className = "",
  onChange,
  datalistArray = [],
  ...props
}) => {
  return (
    <>
      <input
        type="range"
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className={`SonicSliderInput ${className}`}
        {...props}
        list="tickmarks"
      />
      {datalistArray?.length > 0 && (
        <datalist id="tickmarks">
          {datalistArray.map((item) => (
            <option key={item?.label} value={item?.value} label={item?.label} />
          ))}
        </datalist>
      )}
    </>
  );
};

export default SonicSliderInput;
