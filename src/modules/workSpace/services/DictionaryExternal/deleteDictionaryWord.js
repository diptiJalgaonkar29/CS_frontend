import axiosTTSPrivateInstance from "../../../../axios/axiosTTSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";

const deleteDictionaryWord = ({ data, onSuccess, onError }) => {
  axiosTTSPrivateInstance
    .post("/api/musicbank/RemoveDictionaryWord", data)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default deleteDictionaryWord;
