import React from "react";
import getSuperBrandName from "../../../common/utils/getSuperBrandName";
import WPPTabHeaders from "../../wpp/components/Tabs/TabHeaders/WPPTabHeaders";
import SonicTabHeaders from "../../sonicspace/components/Tabs/TabHeaders/SonicTabHeaders";
import { brandConstants } from "../../../utils/brandConstants";

const TabHeaderWrapper = (props) => {
  const superBrandName = getSuperBrandName();

  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPTabHeaders {...props} />;

    default:
  return <SonicTabHeaders {...props} />;
  }
};

export default TabHeaderWrapper;
