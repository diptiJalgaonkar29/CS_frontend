import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

// const WPPTextArea = React.lazy(() =>
//   import("../wpp/components/TextArea/WPPTextArea")
// );
// const SonicTextArea = React.lazy(() =>
//   import("../sonicspace/components/TextArea/SonicTextArea")
// );

const importWPPTextArea = () =>
  import("../wpp/components/TextArea/WPPTextArea").then((mod) => ({
    default: mod.WPPTextArea || mod.default,
  }));

const importSonicTextArea = () =>
  import("../sonicspace/components/TextArea/SonicTextArea").then((mod) => ({
    default: mod.SonicTextArea || mod.default,
  }));

// Lazy versions
const WPPTextArea = React.lazy(importWPPTextArea);
const SonicTextArea = React.lazy(importSonicTextArea);

const superBrandName = getSuperBrandName();
// import SonicTextArea from "../sonicspace/components/TextArea/SonicTextArea";

const RenderTextArea = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPTextArea {...props} />;
    default:
  return <SonicTextArea {...props} />;
  }
};

const TextAreaWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderTextArea {...props} />
    </Suspense>
  );
};

export default TextAreaWrapper;
