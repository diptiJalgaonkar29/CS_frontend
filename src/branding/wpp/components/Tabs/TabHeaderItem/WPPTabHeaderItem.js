import React from "react";
import "./WPPTabHeaderItem.css";
import { WppTab } from "@wppopen/components-library-react";

const WPPTabHeaderItem = ({ label, index, ...props }) => {
  return (
    <WppTab value={index} {...props}>
      {label}
    </WppTab>
  );
};

export default WPPTabHeaderItem;
