import React from "react";
import "./WPPMenu.css";
import { WppButton, WppMenuContext } from "@wppopen/components-library-react";

const WPPMenu = ({ open, onClose, onOpening, children, ...props }) => {
  return (
    <WppMenuContext>
      <WppButton slot="trigger-element">Click to open</WppButton>
      <div>{children}</div>
    </WppMenuContext>
  );
};

export default WPPMenu;
