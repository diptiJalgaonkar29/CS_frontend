import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getTTSOnBrandVoicesV2 = ({ onSuccess, onError }) => {
  axiosTTSPrivateInstanceV2
    .post(`/api/Voice/getbrandvoices?count=${4}`)
    .then((res) => {
      onSuccess?.(res);
      // console.log("OnBrandData",res.data)
    })
    .catch((err) => {
      console.log("Error", err);
      // showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTTSOnBrandVoicesV2;
