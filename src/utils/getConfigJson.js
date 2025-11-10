import loadConfigJson from "./loadConfigJson";

const getConfigJson = () => {
  let configStr = localStorage.getItem("config");
  // console.log("getConfigJson", configStr, window?.globalConfig);
  if (JSON.stringify(window?.globalConfig) !== "{}" && window?.globalConfig !== undefined) {
    return window?.globalConfig;
  } else if (configStr) {
    try {
      return JSON.parse(configStr);
    } catch (error) {
      console.error("error", error);
    }
  } else {
    // console.log("call storeconfiginls");
    loadConfigJson()
      .then(() => getConfigJson())
      .catch((err) => console.error("err", err));
  }
};
export default getConfigJson;

// import { store } from "../../redux/stores/store";

// const getConfigJson = () => {
//   const configJson = store.getState()?.configJson;
//   console.log("configJson**", configJson);
//   return configJson || {};
// };
// export default getConfigJson;
