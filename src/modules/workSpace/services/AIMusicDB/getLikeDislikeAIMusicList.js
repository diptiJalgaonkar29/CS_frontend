import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { store } from "../../../../reduxToolkit/store";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";

const getLikeDislikeAIMusicList = ({ projectId, onSuccess, onError }) => {
  let dispatch = store.dispatch;
  axiosCSPrivateInstance
    .get(`/likedmusic/getAiMusicStatus/${projectId}`)
    .then((response) => {
      onSuccess?.(response);
      dispatch(
        SET_AI_MUSIC_META({
          likedAIMusicArr: response?.data?.liked || [],
          dislikedAIMusicArr: response?.data?.disliked || [],
        })
      );
    })
    .catch((err) => {
      console.log("Error updating ai meta", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getLikeDislikeAIMusicList;
