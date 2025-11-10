import React from "react";
import "./SonicToggle.css";

const SonicToggle = ({
  label,
  bgColor = "--color-primary",
  checked,
  ...props
}) => {
  return (
    <div className="sonicToggle_container">
      <label className="switch">
        <input
          type="checkbox"
          className="legendMarker"
          checked={checked}
          {...props}
        />
        <span
          className="slider round"
          style={{
            background: checked ? `var(${bgColor})` : null,
          }}
        ></span>
        <span className="legendLabel">{label}</span>
      </label>
    </div>
  );
};
export default SonicToggle;
