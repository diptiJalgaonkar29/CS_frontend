import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const deleteDictionaryMeta = ({ dictDataID, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .delete(`/dictionary/delete_dictionary/${dictDataID}`)
    .then((response) => {
      onSuccess?.(response);
    })
    .catch((err) => {
      console.log("err", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default deleteDictionaryMeta;
