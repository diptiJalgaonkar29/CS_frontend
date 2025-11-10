import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";

const WPPRangeSlider = React.lazy(() =>
  import("../wpp/components/RangeSlider/WPPRangeSlider")
);
const SonicRangeSlider = React.lazy(() =>
  import("../sonicspace/components/RangeSlider/SonicRangeSlider")
);
//import SonicRangeSlider from "../sonicspace/components/RangeSlider/SonicRangeSlider";

const superBrandName = getSuperBrandName();

const RenderRangeSlider = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPRangeSlider {...props} />;
    default:
  return <SonicRangeSlider {...props} />;
  }
};

const RangeSliderWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderRangeSlider {...props} />
    </Suspense>
  );
};

export default RangeSliderWrapper;
