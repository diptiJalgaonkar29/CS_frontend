import React, { Suspense } from "react";
import { brandConstants } from "../../../utils/brandConstants";
import getSuperBrandName from "../../../utils/getSuperBrandName";

// // Lazy load components outside the wrapper
const WPPMenuItem = React.lazy(() =>
  import("../../wpp/components/Menu/MenuItem/WPPMenuItem")
);
const SonicMenuItem = React.lazy(() =>
  import("../../sonicspace/components/Menu/MenuItem/SonicMenuItem")
);

// Get brand name outside for reusability
const superBrandName = getSuperBrandName();

// import SonicMenuItem from "../../sonicspace/components/Menu/MenuItem/SonicMenuItem";

// Separate component for rendering the menu item
const RenderMenuItem = (props) => {
  switch (superBrandName) {
  case brandConstants.WPP:
    return <SonicMenuItem {...props} />;
  default:
  return <SonicMenuItem {...props} />;
  }
};

const MenuItemWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderMenuItem {...props} />
    </Suspense>
  );
};

export default MenuItemWrapper;
