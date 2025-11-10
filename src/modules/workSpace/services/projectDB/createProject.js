import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const createProject = ({ projectMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/project/add", projectMeta)
    .then((res) => {
      showNotification(
        "SUCCESS",
        `${projectMeta.projectName} created succesfully!`
      );
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error while Creating Project", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default createProject;
