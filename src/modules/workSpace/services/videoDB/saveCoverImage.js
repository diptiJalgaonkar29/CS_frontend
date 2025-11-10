import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { store } from "../../../../reduxToolkit/store";
import { SET_VIDEO_META } from "../../redux/videoSlice";

const saveCoverImage = ({ projectID, base64ImageUrl, onSuccess, onError }) => {
  let dispatch = store.dispatch;
  axiosCSPrivateInstance
    .post(`/video/coverImg/${projectID}`, base64ImageUrl, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
    .then((res) => {
      dispatch(
        SET_VIDEO_META({
          coverImage: res?.data?.cover_image,
        })
      );
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      onError?.();
    });
};
export default saveCoverImage;
