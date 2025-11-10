import getSuperBrandName from "../../utils/getSuperBrandName";
import SonicIcons from "../sonicspace/assets/icons/icons";
import WPPIcons from "../wpp/assets/icons/icons";
import { brandConstants } from "../../utils/brandConstants";

const IconWrapper = (props) => {
  const superBrandName = getSuperBrandName();
  const { icon, ...rest } = props;

  let SelectedIcon;

  switch (superBrandName) {
    case brandConstants.WPP: {
      SelectedIcon = WPPIcons?.[icon];
      break;
    }
    default: {
      SelectedIcon = SonicIcons?.[icon];
      break;
    }
  }

  // Prevent UI crash if icon not found
  if (!SelectedIcon) {
    console.warn(`Icon "${icon}" not found for brand "${superBrandName}"`);
    return null; // Or return a fallback <span>❓</span>
  }

  return <SelectedIcon {...rest} />;
};

export default IconWrapper;
