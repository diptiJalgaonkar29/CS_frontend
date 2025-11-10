import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { store } from "../../../../reduxToolkit/store";
import { HANDLE_LIKE_DISLIKE_AI_MUSIC } from "../../redux/AIMusicSlice";

const likeDislikeAIMusic = ({ likeDislikeAIMusicMeta, onSuccess, onError }) => {
  let dispatch = store.dispatch;
  axiosCSPrivateInstance
    .post(`/likedmusic/add`, likeDislikeAIMusicMeta)
    .then((response) => {
      onSuccess?.(response);
      dispatch(
        HANDLE_LIKE_DISLIKE_AI_MUSIC({
          cueId: likeDislikeAIMusicMeta?.cue_id,
          status: likeDislikeAIMusicMeta?.status,
        })
      );
    })
    .catch((err) => {
      console.log("Error updating ai meta", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default likeDislikeAIMusic;
