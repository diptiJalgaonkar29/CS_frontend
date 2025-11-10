import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPVideoInput = React.lazy(() =>
  import("../wpp/components/VideoInput/WPPVideoInput")
);
const SonicVideoInput = React.lazy(() =>
  import("../sonicspace/components/VideoInput/SonicVideoInput")
);
//import SonicVideoInput from "../sonicspace/components/VideoInput/SonicVideoInput";

const superBrandName = getSuperBrandName();

const RenderVideoInput = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPVideoInput {...props} />;
    default:
  return <SonicVideoInput {...props} />;
  }
};

const VideoInputWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderVideoInput {...props} />
    </Suspense>
  );
};

export default VideoInputWrapper;
