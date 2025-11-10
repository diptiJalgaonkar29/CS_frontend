import { WppTabs } from "@wppopen/components-library-react";
import React from "react";

const WPPTabHeaders = ({ value, onChange, children }) => {
  return (
    <WppTabs value={value} onWppChange={onChange}>
      {children}
    </WppTabs>
  );
};

export default WPPTabHeaders;
