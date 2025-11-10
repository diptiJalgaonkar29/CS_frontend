import Axios from "axios";
import { getBrandAssetBaseUrl } from "./getBrandAssetMeta";
import getSuperBrandName from "./getSuperBrandName";
import { brandConstants } from "./brandConstants";

const loadConfigJson = async () => {
  const superBrandName = getSuperBrandName();
  let origin = document.location.origin;
  let configFolderPath =
    process.env.REACT_APP_CONFIG_FOLDER_PATH || "stageServer";
  let configUrl;
  let commonConfigUrl;
  const brandAssetBaseUrl = getBrandAssetBaseUrl();
  // if (window.globalConfig?.IS_WPP_BRAND) {
  if (superBrandName === brandConstants.WPP) {
    configUrl = `${origin}/config/${configFolderPath}/${superBrandName}.json?t=${Date.now()}`;
  } else {
  configUrl = `${brandAssetBaseUrl}/json/${configFolderPath}.json?t=${Date.now()}`;
  commonConfigUrl = `${brandAssetBaseUrl}/json/config.json?t=${Date.now()}`;
  }
  // "/public/brandassets/sonicspace/json/demoServer.json"

  console.log("loadConfigJson- config URL: ", configUrl);

  let commonConfig = {};
  let config = await Axios(configUrl);
  if (!!commonConfigUrl) {
    commonConfig = await Axios(commonConfigUrl);
  }
  console.log("commonConfig.data", commonConfig.data);
  console.log("config.data", config.data);
  let findresponse = { ...config.data, ...commonConfig.data };
  window.globalConfig = findresponse;

  console.log("loadConfigJson- window.globalConfig: ", findresponse);

  // localStorage.setItem("config", JSON.stringify(findresponse));
  return findresponse;
};
export default loadConfigJson;
