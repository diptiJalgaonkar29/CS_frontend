import { WppAccordion, WppTypography } from "@wppopen/components-library-react";
import React from "react";

export const WPPAccordion = ({ title, children }) => (
  <WppAccordion size="m">
    <WppTypography type="m-strong" slot="header">
      {title}
    </WppTypography>
    <WppTypography>{children}</WppTypography>
  </WppAccordion>
);
