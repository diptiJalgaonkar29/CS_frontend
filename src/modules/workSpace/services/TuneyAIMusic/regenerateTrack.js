import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const regenerateTrack = ({ cueID, config, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .post(`/cues/v3/${cueID}/resample`, config)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error regenerateTrack ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default regenerateTrack;
