import getSuperBrandName from "../../utils/getSuperBrandName";
import WPPIconButton from "../wpp/components/IconButton/WPPIconButton";
import SonicIconButton from "../sonicspace/components/IconButton/SonicIconButton";
import SonicIcons from "../sonicspace/assets/icons/icons";
import WPPIcons from "../wpp/assets/icons/icons";
import { brandConstants } from "../../utils/brandConstants";

const IconButtonWrapper = (props) => {
  const superBrandName = getSuperBrandName();

  switch (superBrandName) {
    case brandConstants.WPP:
      const WppIcon = WPPIcons?.[props?.icon];
      return (
        <WPPIconButton {...props}>
          <WppIcon />
        </WPPIconButton>
      );

    default:
      const SonicIcon = SonicIcons?.[props?.icon];
      return (
        <SonicIconButton {...props}>
          <SonicIcon />
        </SonicIconButton>
      );
  }
};
export default IconButtonWrapper;
