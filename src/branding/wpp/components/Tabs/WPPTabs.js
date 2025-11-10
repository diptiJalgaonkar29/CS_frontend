import React, { useState } from "react";
import {
  WppTabs,
  WppTab,
  WppTypography,
} from "@wppopen/components-library-react";

const WPPTabs = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event) => {
    setCurrentTab(event.detail.value);
  };

  return (
    <>
      <WppTabs value={currentTab} onWppChange={handleTabChange}>
        <WppTab value={0}>Houses</WppTab>
        <WppTab value={1}>Cars</WppTab>
      </WppTabs>
      {+currentTab === 0 && (
        <WppTypography type="xs-body-regular" className="tab-content">
          First content
        </WppTypography>
      )}
      {+currentTab === 1 && (
        <WppTypography type="xs-body-regular" className="tab-content">
          Second content
        </WppTypography>
      )}
    </>
  );
};

export default WPPTabs;
