import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";
import { store } from "../../../reduxToolkit/store";

export const initAIAnalysisStability = ({ data, onSuccess, onError, onFinally, projectID }) => {
  axiosCSPrivateInstance
    .post(`/stability/generate-audio`, data)
    .then(async (response) => {
      const fileNames = response.data; // e.g. ["file1.mp3", "file2.mp3"]

      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        showNotification("ERROR", "No files returned from Stability AI.");
        onError?.();
        return;
      }
      onSuccess?.(fileNames); // Pass fileNames to the callback
    })
    .catch((error) => {
      console.error("Error in Stability AI Music Response:", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    })
    .finally(() => {
      onFinally?.();
    });
};