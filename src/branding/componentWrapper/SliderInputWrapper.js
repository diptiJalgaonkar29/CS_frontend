import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPSliderInput = React.lazy(() =>
  import("../wpp/components/SliderInput/WPPSliderInput")
);
const SonicSliderInput = React.lazy(() =>
  import("../sonicspace/components/SliderInput/SonicSliderInput")
);

const superBrandName = getSuperBrandName();

// import SonicSliderInput from "../sonicspace/components/SliderInput/SonicSliderInput";

const RenderSliderInput = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPSliderInput {...props} />;
    default:
  return <SonicSliderInput {...props} />;
  }
};

const SliderInputWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderSliderInput {...props} />
    </Suspense>
  );
};

export default SliderInputWrapper;
