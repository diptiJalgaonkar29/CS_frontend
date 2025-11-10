import {
  osName,
  fullBrowserVersion,
  browserName,
  getUA,
  deviceType,
} from "react-device-detect";

const getClientMeta = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const href = window.location.href;
  return {
    browserName: browserName,
    browserVersion: fullBrowserVersion,
    windowSize: `${windowWidth} X ${windowHeight}`,
    href,
    os: osName,
    deviceType: deviceType,
    platform: navigator.platform,
    userAgent: getUA,
  };
};
export default getClientMeta;
