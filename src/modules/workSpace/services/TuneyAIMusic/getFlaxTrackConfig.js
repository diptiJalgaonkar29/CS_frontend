import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getFlaxTrackConfig = ({ flaxTrackID, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .get(`flax_tracks/${flaxTrackID}/configs`)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error getFlaxTrackConfig ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getFlaxTrackConfig;
