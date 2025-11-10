import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const fileUpload = ({ formdata, configMeta, onSuccess, onError }) => {
  console.log("formdata", formdata);
  axiosCSPrivateInstance
    .post(`/ai_analysis/upload`, formdata, {
      ...configMeta,
      headers: {
        "Content-Type": "multipart/form-data", // Axios automatically sets the correct boundary
      },
    })
    .then((res) => {
      showNotification("SUCCESS", "file uploaded succesfully!");
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default fileUpload;
