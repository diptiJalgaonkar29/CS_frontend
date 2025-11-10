import axios from "axios";
import getTuneyRefreshToken from "../utils/getTuneyRefreshToken";
import trackExternalAPICalls from "../common/service/trackExternalAPICalls";
import getTuneyUsedForByUrl from "../modules/workSpace/helperFunctions/getTuneyUsedForByUrl";

let axiosTuneyUserInstance = axios.create({
  baseURL: process.env.REACT_APP_API_TUNEY_API_USER_BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Always ensure fresh token
axiosTuneyUserInstance.interceptors.request.use(
  async (config) => {
    let tuneyToken = localStorage.getItem("tuneyToken");
    if (!tuneyToken) {
      tuneyToken = await getTuneyRefreshToken();
    }
    config.headers["Authorization"] = `Bearer ${tuneyToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosTuneyUserInstance.interceptors.response.use(
  (response) => {
    trackExternalAPICalls({
      url: (response?.config?.baseURL || "") + response?.config?.url,
      requestData: !!response?.config?.data
        ? JSON.stringify(response?.config?.data)
        : "",
      serviceBy: "tuney",
      usedFor: getTuneyUsedForByUrl(
        response?.config?.url,
        response?.config?.method
      ),
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
      serviceBy: "tuney",
      usedFor: getTuneyUsedForByUrl(error?.config?.url, error?.config?.method),
      statusCode: error?.response?.status,
      statusMessage: error?.message,
    });
    const originalConfig = error.config;
    if (error?.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      let newRefreshToken = await getTuneyRefreshToken();
      originalConfig.headers["Authorization"] = `Bearer ${newRefreshToken}`;
      if (newRefreshToken) {
        axiosTuneyUserInstance.defaults.headers.common["Authorization"] =
          newRefreshToken;
        return axiosTuneyUserInstance(originalConfig);
      } else {
        return;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosTuneyUserInstance;
