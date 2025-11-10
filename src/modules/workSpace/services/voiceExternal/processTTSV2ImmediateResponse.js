import showNotification from "../../../../common/helperFunctions/showNotification";
import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";
import addPronounciationTTSResponse from "../DictionaryDB/addPronounciationTTSResponse";
import { merge } from "lodash";

const processTTSV2ImmediateResponse = ({
  jobRequest,
  ttsArtistMeta = {},
  onSuccess,
  onError,
  onFinally,
}) => {
  axiosTTSPrivateInstanceV2
    .post(`/api/Voice/generatespeechAsync`, jobRequest)
    .then((res) => {
      onSuccess?.(res);
      let responseMeta = merge(ttsArtistMeta, {
        text: jobRequest?.VoiceText,
        tts_type: jobRequest?.TTSType,
        uuid: res?.data?.uuid,
        mp3path: res?.data?.mP3Path,
        duration: res?.data?.duration,
      });
      addPronounciationTTSResponse({ responseMeta });
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    })
    .finally(() => {
      onFinally?.();
    });
};

export default processTTSV2ImmediateResponse;
