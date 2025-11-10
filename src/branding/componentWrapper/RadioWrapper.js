import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPRadio = React.lazy(() => import("../wpp/components/Radio/WPPRadio"));
const SonicRadio = React.lazy(() =>
  import("../sonicspace/components/Radio/SonicRadio")
);

const superBrandName = getSuperBrandName();

// import SonicRadio from "../sonicspace/components/Radio/SonicRadio";

const RenderRadio = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPRadio {...props} />;
    default:
  return <SonicRadio {...props} />;
  }
};

const RadioWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderRadio {...props} />
    </Suspense>
  );
};

export default RadioWrapper;
