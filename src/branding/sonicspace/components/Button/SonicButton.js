import React from "react";
import "./SonicButton.css";
import PropTypes from "prop-types";

const SonicButton = ({
  variant = "outlined", //outlined,filled
  size = "m", // s,l
  className = "",
  children,
  type = "button",
  ...props
}) => {
  return (
    <button
      className={`sonicButton ${variant} ${size} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

SonicButton.propTypes = {
  variant: PropTypes.oneOf(["outlined", "filled"]),
  size: PropTypes.oneOf(["s", "m"]),
};

export default SonicButton;
