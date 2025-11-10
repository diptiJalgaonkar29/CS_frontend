import getSuperBrandId from "./getSuperBrandId";
import getConfigJson from "./getConfigJson";

const superBrandId = getSuperBrandId();

export const getBrandAssetBaseUrl = () => {
  let origin = document.location.origin;
  const brandassetsFolderName =
    localStorage.getItem("brandassetsFolderName") || superBrandId;
  return `${origin}/brandassets/${brandassetsFolderName}`;
};

export const ASSET_PATHS = {
  NAV_LOGO_PATH: "NAV_LOGO_PATH",
  BRAND_VOICE_LOGO_PATH: "BRAND_VOICE_LOGO_PATH",
  FAVICON_PATH: "FAVICON_PATH",
  FALLBACK_LOGO_PATH: "FALLBACK_LOGO_PATH",
  AUTH_RIGHT_BLOCK_IMAGE_PATH: "AUTH_RIGHT_BLOCK_IMAGE_PATH",
  AUTH_BACKGROUND_IMAGE_PATH: "AUTH_BACKGROUND_IMAGE_PATH",
  AUTH_RIGHT_BLOCK_BG_IMAGE_PATH: "AUTH_RIGHT_BLOCK_BG_IMAGE_PATH",
  LIGHT_FONT_PATH: "LIGHT_FONT_PATH",
  MEDIUM_FONT_PATH: "MEDIUM_FONT_PATH",
  BOLD_FONT_PATH: "BOLD_FONT_PATH",
  CSS_PATH: "CSS_PATH",
};

export const getBrandAssetPath = (to) => {
  const configJson = getConfigJson();
  return `${getBrandAssetBaseUrl()}${configJson[to]}`;
};
