import axiosTTSPrivateInstance from "../../../../axios/axiosTTSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const addDictionaryWord = ({ data, onSuccess, onError }) => {
  axiosTTSPrivateInstance
    .post("/api/musicbank/AddDictionaryWord", data)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default addDictionaryWord;
