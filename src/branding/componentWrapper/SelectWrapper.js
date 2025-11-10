import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPSelect = React.lazy(() =>
  import("../wpp/components/Select/WPPSelect")
);
const SonicSelect = React.lazy(() =>
  import("../sonicspace/components/Select/SonicSelect")
);

// import SonicSelect from "../sonicspace/components/Select/SonicSelect";

const superBrandName = getSuperBrandName();

const RenderSelect = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPSelect {...props} />;
    default:
  return <SonicSelect {...props} />;
  }
};

const SelectWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderSelect {...props} />
    </Suspense>
  );
};

export default SelectWrapper;
