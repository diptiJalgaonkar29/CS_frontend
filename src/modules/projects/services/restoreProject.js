import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";

const restoreProject = ({ projectID, projectName, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .get(`/project/restoreProject/${projectID}`)
    .then((response) => {
      onSuccess?.(response);
      showNotification("SUCCESS", `${projectName} restored succesfully!`);
    })
    .catch((err) => {
      console.log("Error while restoring project", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default restoreProject;
