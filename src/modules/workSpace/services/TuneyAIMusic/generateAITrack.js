import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const generateCue = ({ taskID, onProgress }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axiosTuneyCueInstance.get(
        `/tasks/v3/generate/${taskID}`
      );

      switch (response.data.status) {
        case "STARTED":
        case "PENDING":
          setTimeout(async () => {
            try {
              const result = await generateCue({ taskID, onProgress });
              resolve(result);
            } catch (err) {
              reject(err);
            }
            onProgress?.(response);
          }, 3000);
          break;

        case "SUCCESS":
          resolve(response.data);
          break;

        case "FAILURE":
        default:
          showNotification("ERROR", "Something went wrong!");
          reject(new Error("Cue generation failed"));
          break;
      }
    } catch (error) {
      console.log("Error generateCue", error);
      showNotification("ERROR", "Something went wrong!");
      reject(error);
    }
  });
};

const generateAITrack = async (config) => {
  try {
    const taskIdResponse = await axiosTuneyCueInstance.post(
      `/cues/v3/`,
      config
    );
    const taskId = taskIdResponse?.data?.task_id;
    // console.log("taskId", taskId);
    const trackMeta = await generateCue({
      taskID: taskId,
      // onProgress: (res) => console.log("Progress...", res.data),
    });
    return trackMeta;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export default generateAITrack;
