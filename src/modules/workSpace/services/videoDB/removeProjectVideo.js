import { RESET_VIDEO_META, SET_VIDEO_META } from "../../redux/videoSlice";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { store } from "../../../../reduxToolkit/store";
import showNotification from "../../../../common/helperFunctions/showNotification";

const removeProjectVideo = ({ projectID }) => {
  let dispatch = store.dispatch;
  axiosCSPrivateInstance
    .delete(`/video/deleteFile/${projectID}`)
    .then((res) => {
      if (res.data?.status === "success") {
        dispatch(RESET_VIDEO_META());
        showNotification("SUCCESS", "Video removed succesfully!");
      }
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
    });
};

export default removeProjectVideo;
