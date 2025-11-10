import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const likeDislikeArtist = ({ favMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/favourite/addLike", favMeta)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default likeDislikeArtist;
