import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";

const generateTrackVariations = ({
  cueID,
  variationCount,
  onSuccess,
  onError,
}) => {
  axiosTuneyCueInstance
    .get(`/cues/v3/${cueID}/variations?k=${variationCount}`)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error generateTrackVariations ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default generateTrackVariations;
