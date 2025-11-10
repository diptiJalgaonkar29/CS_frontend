import React, { Suspense } from "react";
import getSuperBrandName from "../../utils/getSuperBrandName";
import { brandConstants } from "../../utils/brandConstants";
const superBrandName = getSuperBrandName();

// // Lazy loading components
const WPPProgressBar = React.lazy(() =>
  import("../wpp/components/ProgressBar/WPPProgressBar")
);
const SonicProgressBar = React.lazy(() =>
  import("../sonicspace/components/ProgressBar/SonicProgressBar")
);
//import SonicProgressBar from "../sonicspace/components/ProgressBar/SonicProgressBar";

const RenderProgressBar = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPProgressBar {...props}>{props?.children}</WPPProgressBar>;

    default:
  return <SonicProgressBar {...props}>{props?.children}</SonicProgressBar>;
  }
};

const ProgressBarWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderProgressBar {...props} />
    </Suspense>
  );
};

export default ProgressBarWrapper;
