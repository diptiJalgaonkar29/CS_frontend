import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPFileInput = React.lazy(() =>
  import("../wpp/components/FileInput/WPPFileInput")
);
const SonicFileInput = React.lazy(() =>
  import("../sonicspace/components/FileInput/SonicFileInput")
);

const superBrandName = getSuperBrandName();

// import SonicFileInput from "../sonicspace/components/FileInput/SonicFileInput";

const RenderFileInput = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPFileInput {...props} />;
    default:
  return <SonicFileInput {...props} />;
  }
};

const FileInputWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderFileInput {...props} />
    </Suspense>
  );
};

export default FileInputWrapper;
