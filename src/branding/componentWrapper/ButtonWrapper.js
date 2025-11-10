import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPButton = React.lazy(() =>
  import("../wpp/components/Button/WPPButton")
);
const SonicButton = React.lazy(() =>
  import("../sonicspace/components/Button/SonicButton")
);

// import SonicButton from "../sonicspace/components/Button/SonicButton";

const superBrandName = getSuperBrandName();

const RenderButton = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPButton {...props}>{props?.children}</WPPButton>;
    default:
  return <SonicButton {...props}>{props?.children}</SonicButton>;
  }
};

const ButtonWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderButton {...props} />
    </Suspense>
  );
};

export default ButtonWrapper;
