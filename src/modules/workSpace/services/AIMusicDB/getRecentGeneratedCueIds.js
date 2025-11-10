import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getRecentGeneratedCueIds = ({ projectID, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .get(`/aimusic/findMusicByProjectId/${projectID}`)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("Error updating ai meta", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getRecentGeneratedCueIds;
