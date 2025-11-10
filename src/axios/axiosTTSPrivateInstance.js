import axios from "axios";

let axiosTTSPrivateInstance = axios.create({
  baseURL: process.env.REACT_APP_API_TTS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosTTSPrivateInstance.interceptors.response.use(
  (response) => {
    trackExternalAPICalls({
      url: (response?.config?.baseURL || "") + response?.config?.url,
      requestData: !!response?.config?.data
        ? JSON.stringify(response?.config?.data)
        : "",
      serviceBy: "tts-web",
      usedFor: "tts",
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
      usedFor: "tts",
      statusCode: error?.response?.status,
      statusMessage: error?.message,
    });
    return Promise.reject(error);
  }
);

export default axiosTTSPrivateInstance;
