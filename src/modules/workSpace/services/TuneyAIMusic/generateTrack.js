import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const generateTrack = ({ config, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .post(`/cues/v3/`, config)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error generateTrack ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default generateTrack;
