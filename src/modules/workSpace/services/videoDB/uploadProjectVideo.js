import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const uploadProjectVideo = ({ formdata, configMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post(`/video/uploadVideo?mute=1`, formdata, configMeta)
    .then((res) => {
      showNotification("SUCCESS", "Video uploaded succesfully!");
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default uploadProjectVideo;
