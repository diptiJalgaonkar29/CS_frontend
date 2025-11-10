import React from "react";
import "./WPPMenuItem.css";
import { WppListItem } from "@wppopen/components-library-react";

const WPPMenuItem = ({ children, ...props }) => {
  return (
    <WppListItem {...props}>
      <p slot="label">{children}</p>
    </WppListItem>
  );
};

export default WPPMenuItem;
