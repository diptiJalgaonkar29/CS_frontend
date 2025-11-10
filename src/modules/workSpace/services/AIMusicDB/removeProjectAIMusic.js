import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const removeProjectAIMusic = ({ projectID, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .delete(`/aimusic/deleteMusic/${projectID}`)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.(err);
    });
};

export default removeProjectAIMusic;
