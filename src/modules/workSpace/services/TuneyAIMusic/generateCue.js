import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const generateCue = ({ taskID, onProgress, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .get(`/tasks/v3/generate/${taskID}`)
    .then(async (response) => {
      switch (response.data.status) {
        case "STARTED":
          setTimeout(() => {
            generateCue({
              taskID,
              onProgress,
              onSuccess,
              onError,
            });
            onProgress?.(response);
          }, 3000);
          break;
        case "PENDING":
          setTimeout(() => {
            generateCue({
              taskID,
              onProgress,
              onSuccess,
              onError,
            });
            onProgress?.(response);
          }, 3000);
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
      console.log("Error generateCue ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default generateCue;
