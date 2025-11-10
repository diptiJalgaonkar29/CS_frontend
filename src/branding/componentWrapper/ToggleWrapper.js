import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";

const WPPToggle = React.lazy(() =>
  import("../wpp/components/Toggle/WPPToggle")
);
const SonicToggle = React.lazy(() =>
  import("../sonicspace/components/Toggle/SonicToggle")
);

// import SonicToggle from "../sonicspace/components/Toggle/SonicToggle";

const superBrandName = getSuperBrandName();

const RenderToggle = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPToggle {...props} />;
    default:
  return <SonicToggle {...props} />;
  }
};

const ToggleWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderToggle {...props} />
    </Suspense>
  );
};

export default ToggleWrapper;
