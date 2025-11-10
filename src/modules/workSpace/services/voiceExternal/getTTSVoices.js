import axiosTTSPrivateInstance from "../../../../axios/axiosTTSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getTTSVoices = ({ onSuccess, onError }) => {
  axiosTTSPrivateInstance
    .post("/api/musicbank/voices", {
      key: process.env.REACT_APP_API_TTS_TOKEN,
    })
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTTSVoices;
