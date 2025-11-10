import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";

const getProjects = ({ limit, onSuccess, onError }) => {
  let apiPath;
  if (limit) {
    apiPath = `/project/getProjects?limit=${limit}`;
  } else {
    apiPath = `/project/getProjects`;
  }
  axiosCSPrivateInstance
    .get(apiPath)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("Error while fetching projects", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getProjects;
