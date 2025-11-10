import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getTTSProcessStatusV2 = ({ scriptIds, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/tts_utils/getTtsDetails", scriptIds)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      // showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTTSProcessStatusV2;
