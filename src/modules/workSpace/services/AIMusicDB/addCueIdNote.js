import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const addCueIdNote = ({ cueNoteMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .put(`/likedmusic/update`, cueNoteMeta)
    .then((response) => {
      showNotification("SUCCESS", "Note added successfully!");
      onSuccess?.(response);
    })
    .catch((err) => {
      showNotification("ERROR", "Something went wrong!");
      onError?.(err);
    });
};

export default addCueIdNote;
