import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const addDictionaryMeta = ({ dictMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/dictionary/word", dictMeta)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("err", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default addDictionaryMeta;
