import axios from "axios";
import getTTSToken from "../utils/getTTSToken";
import trackExternalAPICalls from "../common/service/trackExternalAPICalls";
import getTTSUsedForByUrl from "../modules/workSpace/helperFunctions/getTTSUsedForByUrl";

const TTSToken = localStorage.getItem("TTSToken");

let axiosTTSPrivateInstanceV2 = axios.create({
  baseURL: process.env.REACT_APP_API_TTS_BASE_URL_V2,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TTSToken}`,
  },
});

axiosTTSPrivateInstanceV2.interceptors.request.use(
  (config) => {
    let TTSToken = localStorage.getItem("TTSToken");
    config.headers["Authorization"] = `Bearer ${TTSToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosTTSPrivateInstanceV2.interceptors.response.use(
  (response) => {
    trackExternalAPICalls({
      url: response?.config?.baseURL + response?.config?.url,
      requestData: !!response?.config?.data
        ? JSON.stringify(response?.config?.data)
        : "",
      serviceBy: "tts-web",
      usedFor: getTTSUsedForByUrl(response?.config?.url),
      statusCode: response?.status,
      statusMessage: response?.statusText,
    });
    return response;
  },
  async (error) => {
    trackExternalAPICalls({
      url: error?.config?.baseURL + error?.config?.url,
      requestData: !!error?.config?.data
        ? JSON.stringify(error?.config?.data)
        : "",
      serviceBy: "tts-web",
      usedFor: getTTSUsedForByUrl(error?.config?.url),
      statusCode: error?.response?.status,
      statusMessage: error?.message,
    });
    const originalConfig = error.config;
    if (error?.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      let newToken = await getTTSToken();
      originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
      if (newToken) {
        axiosTTSPrivateInstanceV2.defaults.headers.common["Authorization"] =
          newToken;
        return axiosTTSPrivateInstanceV2(originalConfig);
      } else {
        return;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosTTSPrivateInstanceV2;
