import axios from "axios";
import { SET_NOTIFICATION_TOP_BAR } from "../common/redux/notificationTopBarSlice";
import { store } from "../reduxToolkit/store";
import getSuperBrandId from "./getSuperBrandId";
import getConfigJson from "./getConfigJson";

const getPostLoginBanner = ({
  isVisible = false,
  isClosed = false,
  msg = "",
}) => {
  const jsonConfig = getConfigJson();
  let ssDomainPath =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_DEV_SS_DOMAIN
      : jsonConfig?.MUSIC_BANK_DOMAIN;

      console.log("ssDomainPath", ssDomainPath);

  axios(`${ssDomainPath}/api/banner/getBannerActiveForCSPostLogin`, {
    headers: {
      Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
      BrandName: getSuperBrandId(),
      BrandId: localStorage.getItem("brandId"),
    },
  }).then((res) => {
    store.dispatch(
      SET_NOTIFICATION_TOP_BAR({
        isVisible: !!res?.data?.bannerText,
        msg: res?.data?.bannerText,
        isClosed:
          isClosed && !!res?.data?.bannerText && res?.data?.bannerText === msg,
      })
    );
  });
};

export default getPostLoginBanner;
