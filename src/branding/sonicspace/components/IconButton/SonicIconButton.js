import React from "react";
import "./SonicIconButton.css";

const SonicIconButton = (props) => {
  const { children, className = "", ...restProps } = props;
  return (
    <button className={`sonic_icon_button ${className}`} {...restProps}>
      {children}
    </button>
  );
};
export default SonicIconButton;
