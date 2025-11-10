import axiosCSAdminPrivateInstance from "../../../../axios/axiosCSAdminPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import getSuperBrandId from "../../../../utils/getSuperBrandId";

const getDictionaryMeta = ({ onSuccess, onError }) => {
  let superBrandId = getSuperBrandId();
  axiosCSAdminPrivateInstance
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

export default getDictionaryMeta;
