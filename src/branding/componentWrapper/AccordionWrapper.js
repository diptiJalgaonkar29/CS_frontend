import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";
// import SonicAccordion from "../sonicspace/components/Accordion/SonicAccordion";

// Lazy load components outside the wrapper
const WPPAccordion = React.lazy(() =>
  import("../wpp/components/Accordion/WPPAccordion")
);
const SonicAccordion = React.lazy(() =>
  import("../sonicspace/components/Accordion/SonicAccordion")
);

// Get brand name outside for reuse
const superBrandName = getSuperBrandName();

// Separate component for rendering the accordion
const RenderAccordion = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPAccordion {...props} />;
    default:
  return <SonicAccordion {...props} />;
  }
};

const AccordionWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderAccordion {...props} />
    </Suspense>
  );
};

export default AccordionWrapper;
