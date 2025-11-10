import axios from "axios";
import trackExternalAPICalls from "../common/service/trackExternalAPICalls";
import getTTSUsedForByUrl from "../modules/workSpace/helperFunctions/getTTSUsedForByUrl";

let axiosTTSPublicInstanceV2 = axios.create({
  baseURL: process.env.REACT_APP_API_TTS_BASE_URL_V2,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosTTSPublicInstanceV2.interceptors.response.use(
  (response) => {
    trackExternalAPICalls({
      url: (response?.config?.baseURL || "") + response?.config?.url,
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
      url: (error?.config?.baseURL || "") + error?.config?.url,
      requestData: !!error?.config?.data
        ? JSON.stringify(error?.config?.data)
        : "",
      serviceBy: "tts-web",
      usedFor: getTTSUsedForByUrl(error?.config?.url),
      statusCode: error?.response?.status,
      statusMessage: error?.message,
    });
    return Promise.reject(error);
  }
);

export default axiosTTSPublicInstanceV2;
