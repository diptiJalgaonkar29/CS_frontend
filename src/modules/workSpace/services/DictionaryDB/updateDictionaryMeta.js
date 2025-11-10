import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const updateDictionaryMeta = ({ dictMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .put(`/dictionary/update_word`, dictMeta)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("err", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default updateDictionaryMeta;
