import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const updateVoiceMeta = ({ voiceMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/tts_utils/add", voiceMeta)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default updateVoiceMeta;
