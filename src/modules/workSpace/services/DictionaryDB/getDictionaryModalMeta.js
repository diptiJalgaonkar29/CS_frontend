import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import getSuperBrandId from "../../../../utils/getSuperBrandId";

const getDictionaryModalMeta = ({ onSuccess, onError }) => {
  let superBrandId = getSuperBrandId();
  axiosCSPrivateInstance
    .get(`/dictionary/view_all_word/${superBrandId}`)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("err", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getDictionaryModalMeta;
