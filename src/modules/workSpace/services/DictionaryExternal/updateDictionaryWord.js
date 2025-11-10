import axiosTTSPrivateInstance from "../../../../axios/axiosTTSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import isJsonString from "../../../../utils/isJsonString";
import deleteDictionaryMeta from "../DictionaryDB/deleteDictionaryMeta";
import addDictionaryWord from "./addDictionaryWord";
import deleteDictionaryWord from "./deleteDictionaryWord";

const updateDictionaryWord = ({
  data,
  prevLanguageCode,
  onSuccess,
  onError,
}) => {
  let removeWordMeta = {
    key: process.env.REACT_APP_API_TTS_TOKEN,
    LanguageCode: prevLanguageCode,
    Word: data?.original_word,
  };
  let addWordMeta = {
    key: process.env.REACT_APP_API_TTS_TOKEN,
    LanguageCode: isJsonString(data?.language)
      ? JSON.parse(data?.language)?.value
      : "",
    Word: data?.original_word,
    ReplaceWord: data?.formatted_word,
  };
  deleteDictionaryWord({
    data: removeWordMeta,
    onSuccess: () => {
      addDictionaryWord({
        data: addWordMeta,
        onSuccess,
        onError: (err) => {
          console.log("Error", err);
          showNotification("ERROR", "Something went wrong!");
          onError?.();
        },
      });
    },
    onError: (err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    },
  });
};

export default updateDictionaryWord;
