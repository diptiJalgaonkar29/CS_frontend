import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";

const getStabilityById = ({ projectId, onSuccess, onError }) => {
    axiosCSPrivateInstance
        .get(`stability/getStabilityDataByProjectId/${projectId}`)
        .then((response) => {
            onSuccess?.(response);
        })
        .catch((err) => {
            console.log("Error while fetching projects", err);
            showNotification("ERROR", "Something went wrong!");
            onError?.();
        });
};

export default getStabilityById;