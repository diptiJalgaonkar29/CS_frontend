import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../utils/getSuperBrandName";

const WPPSearchBar = React.lazy(() =>
  import("../wpp/components/SearchBar/WPPSearchBar")
);
const SonicSearchBar = React.lazy(() =>
  import("../sonicspace/components/SearchBar/SonicSearchBar")
);

// import SonicSearchBar from "../sonicspace/components/SearchBar/SonicSearchBar";

const superBrandName = getSuperBrandName();

const RenderSearchBar = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPSearchBar {...props} />;
    default:
  return <SonicSearchBar {...props} />;
  }
};

const SearchInputWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderSearchBar {...props} />
    </Suspense>
  );
};

export default SearchInputWrapper;
