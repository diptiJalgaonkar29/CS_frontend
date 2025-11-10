import showNotification from "../../../../common/helperFunctions/showNotification";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { TTS_STATUS } from "../../constants/TTSStatus";
import { store } from "../../../../reduxToolkit/store";
import { ElevenLabsVoiceProvider } from "../../constants/VoiceProviders";
import { UPDATE_TTS_STATUS } from "../../redux/voicesSlice";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { PROFANITY_STATUS } from "../../constants/profanityStatus";

const processTTSV2 = ({
  projectID,
  jobRequest,
  onSuccess,
  onError,
  onFinally,
}) => {
  if (!Array.isArray(jobRequest) || jobRequest?.length === 0) return;
  const dispatch = store.dispatch;
  let { brandMeta } = getCSUserMeta();

  const requestObject = jobRequest
    .map((data) => ({
      voiceText: data?.content,
      ttsType: data?.ttsType || "tts",
      profanityCheck: brandMeta?.profanity,
      shortName: data?.voice,
      displayName: data?.artistName,
      voiceProvider: data?.voiceProvider,
      speakingStyle: data?.speakingStyle || "general",
      ...(brandMeta?.profanity && {
        langCode: data?.langCode || "en",
      }),
      ...(data?.voiceProvider !== ElevenLabsVoiceProvider
        ? { speakingSpeed: data?.speed || "1", pitch: data?.pitch || "1" }
        : {
            voiceSettingsElevenLabs: JSON.stringify({
              stability: data?.stability || "0.5",
              similarityBoost: data?.similarityBoost || "0.7",
              style: data?.style || "0",
              useSpeakerBoost: data?.useSpeakerBoost ?? true,
            }),
            // as backend wants stringify data
          }),
      scriptId: data?.voiceUUID,
    }))
    ?.filter((data) => !!data.voiceText);

  if (requestObject?.length === 0) {
    return;
  }

  axiosCSPrivateInstance
    .post(`/tts_utils/listOfTTSObjects/${projectID}`, requestObject)
    .then((res) => {
      // console.log("jobRequest", jobRequest);

      let updateTTSStatus = jobRequest.map((data) => ({
        scriptId: data?.voiceUUID,
        ttsStatus: TTS_STATUS.STARTED,
        profanity: brandMeta?.profanity,
        ...(brandMeta?.profanity && {
          profanityStatus: PROFANITY_STATUS.STARTED,
        }),
      }));

      dispatch(UPDATE_TTS_STATUS(updateTTSStatus));
      onSuccess?.(res);
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

export default processTTSV2;
