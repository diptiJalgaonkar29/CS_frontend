import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";
import showNotification from "../../../../common/helperFunctions/showNotification";

const setTTSPronunciationV2 = ({ data, onSuccess, onError }) => {
  axiosTTSPrivateInstanceV2
    .post("/api/Pronunciation/setpronunciation", data)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default setTTSPronunciationV2;
