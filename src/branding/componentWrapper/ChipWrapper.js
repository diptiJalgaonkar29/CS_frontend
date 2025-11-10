import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";

const WPPChip = React.lazy(() => import("../wpp/components/Chip/WPPChip"));
const SonicChip = React.lazy(() =>
  import("../sonicspace/components/Chip/SonicChip")
);

const superBrandName = getSuperBrandName();

// import SonicChip from "../sonicspace/components/Chip/SonicChip";

const RenderChip = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPChip {...props} />;
    default:
  return <SonicChip {...props} />;
  }
};

const ChipWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderChip {...props} />
    </Suspense>
  );
};

export default ChipWrapper;
