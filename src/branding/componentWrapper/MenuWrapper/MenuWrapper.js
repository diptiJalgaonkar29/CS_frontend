import React, { Suspense } from "react";
import { brandConstants } from "../../../utils/brandConstants";
import getSuperBrandName from "../../../utils/getSuperBrandName";

// Lazy load components outside the wrapper
const WPPMenu = React.lazy(() => import("../../wpp/components/Menu/WPPMenu"));
const SonicMenu = React.lazy(() =>
  import("../../sonicspace/components/Menu/SonicMenu")
);
//import SonicMenu from "../../sonicspace/components/Menu/SonicMenu";

// Get brand name outside for reuse
const superBrandName = getSuperBrandName();

// Separate component for rendering the menu
const RenderMenu = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <SonicMenu {...props} />;
    default:
  return <SonicMenu {...props} />;
  }
};

const MenuWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderMenu {...props} />
    </Suspense>
  );
};

export default MenuWrapper;
