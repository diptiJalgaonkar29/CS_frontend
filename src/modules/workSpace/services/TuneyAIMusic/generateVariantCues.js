import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const generateVariantCues = ({
  taskID,
  cueID,
  onProgress,
  onSuccess,
  onError,
}) => {
  if (!taskID && !cueID) return;
  axiosTuneyCueInstance
    .get(`/cues/v3/${cueID}/variations/tasks/${taskID}`)
    .then(async (response) => {
      switch (response.data.status) {
        case "STARTED":
          setTimeout(() => {
            generateVariantCues({
              taskID,
              cueID,
              onProgress,
              onSuccess,
              onError,
            });
            onProgress?.(response);
          }, 5000);
          break;
        case "PENDING":
          setTimeout(() => {
            generateVariantCues({
              taskID,
              cueID,
              onProgress,
              onSuccess,
              onError,
            });
            onProgress?.(response);
          }, 5000);
          break;
        case "SUCCESS":
          onSuccess?.(response);
          break;
        case "FAILURE":
          showNotification("ERROR", "Something went wrong!");
          onError?.();
          break;
        default:
          showNotification("ERROR", "Something went wrong!");
          onError?.();
          break;
      }
    })
    .catch(function (error) {
      console.log("Error generateVariantCues ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default generateVariantCues;
