import React from "react";
import getSuperBrandName from "../../../common/utils/getSuperBrandName";
import WPPTabHeaderItem from "../../wpp/components/Tabs/TabHeaderItem/WPPTabHeaderItem";
import SonicTabHeaderItem from "../../sonicspace/components/Tabs/TabHeaderItem/SonicTabHeaderItem";
import { brandConstants } from "../../../utils/brandConstants";

const TabHeaderItemWrapper = (props) => {
  const superBrandName = getSuperBrandName();

  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPTabHeaderItem {...props} />;

    default:
  return <SonicTabHeaderItem {...props} />;
  }
};

export default TabHeaderItemWrapper;
