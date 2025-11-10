import React from "react";
import { WppProgressIndicator } from "@wppopen/components-library-react";
import "./WPPProgressBar.css";

const WPPProgressBar = ({ processPercent }) => {
  return <WppProgressIndicator variant="bar" value={processPercent} />;
};

export default WPPProgressBar;
