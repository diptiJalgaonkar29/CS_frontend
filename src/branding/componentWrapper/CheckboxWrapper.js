import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPCheckbox = React.lazy(() =>
  import("../wpp/components/Checkbox/WPPCheckbox")
);
const SonicCheckbox = React.lazy(() =>
  import("../sonicspace/components/Checkbox/SonicCheckbox")
);

const superBrandName = getSuperBrandName();

// import SonicCheckbox from "../sonicspace/components/Checkbox/SonicCheckbox";

const RenderCheckbox = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPCheckbox {...props} />;
    default:
  return <SonicCheckbox {...props} />;
  }
};

const CheckboxWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderCheckbox {...props} />
    </Suspense>
  );
};

export default CheckboxWrapper;
