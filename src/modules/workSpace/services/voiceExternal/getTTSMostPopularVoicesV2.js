import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getTTSMostPopularVoicesV2 = ({ shortName, onSuccess, onError }) => {
  axiosTTSPrivateInstanceV2
    .post("/api/Voice/getselectedvoiceartistlist", { shortName })
    .then((res) => {
      onSuccess?.(res);
      // console.log("res",res.data.voiceData)
    })
    .catch((err) => {
      console.log("Error", err);
      // showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTTSMostPopularVoicesV2;
