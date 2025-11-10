import axios from "axios";
import getCSUserMeta from "../utils/getCSUserMeta";
import { store } from "../reduxToolkit/store";
import { REMOVE_AUTH_STATE } from "../modules/auth/redux/authSlice";
import { RESET_NOTIFICATION_TOP_BAR } from "../common/redux/notificationTopBarSlice";
import getSuperBrandId from "../utils/getSuperBrandId";

let axiosSSPrivateInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    BrandName: getSuperBrandId(),
    BrandId: localStorage.getItem("brandId"),
  },
});

axiosSSPrivateInstance.interceptors.request.use(
  (config) => {
    const { SSToken, brandMeta } = getCSUserMeta();
    config.baseURL = `${brandMeta?.SSDomainPath}/api`;
    config.headers["Authorization"] = `Bearer ${SSToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosSSPrivateInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    if (error?.response?.status === 401 && !originalConfig._retry) {
      // console.log("axiosSSPrivateInstance 401");
      store.dispatch(REMOVE_AUTH_STATE());
      store.dispatch(RESET_NOTIFICATION_TOP_BAR());
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosSSPrivateInstance;
