import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

// const WPPInput = React.lazy(() => import("../wpp/components/Input/WPPInput"));
// const SonicInput = React.lazy(() =>
//   import("../sonicspace/components/Input/SonicInput")
// );
const pickExport = (mod, possibleNames = []) => {
  if (!mod) return null;
  if (mod.default) return mod.default;
  for (const n of possibleNames) {
    if (mod[n]) return mod[n];
  }
  if (typeof mod === "function") return mod;
  return (props) => <input {...props} />;
};

const WPPInput = React.lazy(() =>
  import("../wpp/components/Input/WPPInput").then((m) => ({
    default: pickExport(m, ["WPPInput", "WppInput", "Input"]),
  }))
);

const SonicInput = React.lazy(() =>
  import("../sonicspace/components/Input/SonicInput").then((m) => ({
    default: pickExport(m, ["SonicInput", "Sonic", "Input"]),
  }))
);

const superBrandName = getSuperBrandName();

const RenderInput = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPInput {...props} />;
    default:
      return <SonicInput {...props} />;
  }
};

// const InputWrapper = (props) => {
//   return (
//     <Suspense fallback={<></>}>
//       <RenderInput {...props} />
//     </Suspense>
//   );
// };

// export default InputWrapper;

// import React from "react";
// import SonicInput from "../sonicspace/components/Input/SonicInput";
// import { WPPInput } from "../wpp/components/Input/WPPInput";
// import getSuperBrandName from "../../utils/getSuperBrandName";
// import { brandConstants } from "../../utils/brandConstants";

const InputWrapper = (props) => {
  const superBrandName = getSuperBrandName();

  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPInput {...props} />;

    default:
  return <SonicInput {...props} />;
  }
};
export default InputWrapper;
