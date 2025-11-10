import axiosCSPrivateInstance from "../../axios/axiosCSPrivateInstance";
import getSuperBrandId from "../../utils/getSuperBrandId";
import getCSUserMeta from "../../utils/getCSUserMeta";
import getClientMeta from "../../utils/getClientMeta";
import showNotification from "../helperFunctions/showNotification";

const trackExternalAPICalls = ({
  url,
  requestData,
  usedFor,
  serviceBy,
  statusCode,
  statusMessage,
  onSuccess,
  onError,
}) => {
  let { brandMeta } = getCSUserMeta();

  const { deviceType, windowSize, os, browserVersion, browserName } =
    getClientMeta();

  let isPersonalizedTrackingAllowed =
    brandMeta?.isPersonalizedTrackingAllowed ?? true;

  let data = {
    url,
    requestData,
    usedFor,
    serviceBy,
    statusCode,
    statusMessage,
    brandId: getSuperBrandId(),
    ...(isPersonalizedTrackingAllowed && {
      deviceType,
      windowSize,
      os,
      browserVersion,
      browserName,
    }),
  };
  axiosCSPrivateInstance
    .post("/trackingData", data)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("err", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default trackExternalAPICalls;
