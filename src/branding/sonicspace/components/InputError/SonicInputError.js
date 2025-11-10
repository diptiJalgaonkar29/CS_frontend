import React from "react";
import "./SonicInputError.css";

const SonicInputError = ({ className = "", children, ...props }) => {
  return (
    <p className={`SonicInputError ${className}`} {...props}>
      {children}
    </p>
  );
};

export default SonicInputError;
