import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";

const deleteProject = ({ projectID, projectName, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .delete(`/project/deleteProject/${projectID}`)
    .then((response) => {
      onSuccess?.(response);
      showNotification("SUCCESS", `${projectName} deleted succesfully!`);
    })
    .catch((err) => {
      console.log("Error while restoring project", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default deleteProject;
