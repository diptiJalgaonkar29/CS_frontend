import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

// const WPPModal = React.lazy(() => import("../wpp/components/Modal/WPPModal"));
// const SonicModal = React.lazy(() =>
//   import("../sonicspace/components/Modal/SonicModal")
// );

const importWPPModal = () =>
  import("../wpp/components/Modal/WPPModal").then((mod) => ({
    default: mod.WPPModal || mod.default,
  }));

const importSonicModal = () =>
  import("../sonicspace/components/Modal/SonicModal").then((mod) => ({
    default: mod.SonicModal || mod.default,
  }));

// Lazy components
const WPPModal = React.lazy(importWPPModal);
const SonicModal = React.lazy(importSonicModal);

// import SonicModal from "../sonicspace/components/Modal/SonicModal";

const superBrandName = getSuperBrandName();

const RenderModal = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPModal {...props} />;
    default:
  return <SonicModal {...props} />;
  }
};

const ModalWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderModal {...props} />
    </Suspense>
  );
};

export default ModalWrapper;
