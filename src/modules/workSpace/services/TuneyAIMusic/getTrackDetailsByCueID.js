import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getTrackDetailsByCueID = ({ controller, cueID, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .get(`/cues/v3/${cueID}`, { signal: controller?.signal })
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error getTrackDetailsByCueID ", error);
      if (error?.code === "ERR_CANCELED") return;
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTrackDetailsByCueID;
