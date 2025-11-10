import fallbackLogo from "./assets/fallback/logo.png";
import NavLogo from "./assets/navbar/logo.png";
import OutlinedLogo from "./assets/navbar/logo.png";
import Loader from "./assets/loader/loader.gif";
import fonts from "./theme/fonts";
import theme from "./theme/theme";
import favicon from "./assets/favicon/favicon.png";

//Added by Trupti-Wits (brandname, download form values)
export default {
  superBrandName: "wpp",
  assets: {
    navbar: {
      NavLogo,
    },
    fallback: {
      logo: fallbackLogo,
    },
    Loader,
    favicon,
    OutlinedLogo,
  },
  theme,
  fonts,
  modules: {
    SHOW_LOGIN_PAGE: false,
    CS_TO_SS_AI_TRACK_TRANSFER: true,
    TRACK_NAME_DESCRIPTION_BY_OPEN_AI: true,
    SHOW_EXPORT_BTN: true,
    KEYCLOACK_AUTH: true,
    SHOW_SSO_LOGOUT: false,
  },
  configVariables: {
    timelineThumbnailsCount: 20,
  },
};
