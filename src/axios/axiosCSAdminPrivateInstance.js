import axios from "axios";
import getCSUserMeta, { getCSUserRole } from "../utils/getCSUserMeta";
import { store } from "../reduxToolkit/store";
import { REMOVE_AUTH_STATE } from "../modules/auth/redux/authSlice";
import { RESET_NOTIFICATION_TOP_BAR } from "../common/redux/notificationTopBarSlice";
import getSuperBrandId from "../utils/getSuperBrandId";

let axiosCSAdminPrivateInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosCSAdminPrivateInstance.interceptors.request.use(
  (config) => {
    const { CSToken, authMeta } = getCSUserMeta();

    console.log("authMeta", authMeta.userRole);
    const hasBrandNameHeader = config.headers["BrandName"] || "";
    if (!hasBrandNameHeader) {
      config.headers["BrandName"] = getSuperBrandId();
    }
    const hasBrandIdHeader = config.headers["BrandId"] || "";
    if (!hasBrandIdHeader && authMeta?.userRole !== "ROLE_SUPER_ADMIN") {
      config.headers["BrandId"] = localStorage.getItem("brandId");
    }
    config.headers["Authorization"] = `Bearer ${CSToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosCSAdminPrivateInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    if (error?.response?.status === 401 && !originalConfig._retry) {
      // console.log("axiosCSAdminPrivateInstance 401");
      store.dispatch(REMOVE_AUTH_STATE());
      store.dispatch(RESET_NOTIFICATION_TOP_BAR());
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosCSAdminPrivateInstance;
