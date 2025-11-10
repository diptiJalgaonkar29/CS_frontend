import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { store } from "../../../../reduxToolkit/store";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";

const updateAIMusicMeta = ({
  projectID,
  AIMusicMeta,
  recentAIGeneratedData,
  onSuccess,
  onError,
}) => {
  let dispatch = store.dispatch;
  axiosCSPrivateInstance
    .patch(`/aimusic/update/${projectID}`, AIMusicMeta)
    .then((response) => {
      onSuccess?.(response);
      if ("variantCueIds" in AIMusicMeta) {
        let cueIdsArr;
        try {
          cueIdsArr = JSON.parse(AIMusicMeta?.variantCueIds);
        } catch (error) {
          cueIdsArr = [];
        }

        dispatch(
          SET_AI_MUSIC_META({
            recentAIGeneratedData: [...cueIdsArr, ...recentAIGeneratedData],
          })
        );
      }
    })
    .catch((err) => {
      console.log("Error updating ai meta", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default updateAIMusicMeta;
