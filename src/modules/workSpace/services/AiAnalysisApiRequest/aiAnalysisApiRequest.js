import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const aiAnalysisApiRequest = ({ data, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post(`/ai_analysis/`, data)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default aiAnalysisApiRequest;
