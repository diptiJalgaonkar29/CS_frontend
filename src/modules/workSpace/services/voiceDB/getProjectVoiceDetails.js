import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { store } from "../../../../reduxToolkit/store";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { PROFANITY_STATUS } from "../../constants/profanityStatus";
import { TTS_STATUS } from "../../constants/TTSStatus";
import updateTTSTimelineMeta from "../../helperFunctions/updateTTSTimelineMeta";
import {
  ADD_NEW_TTS_SCRIPT_IDS,
  SET_VOICE_META,
} from "../../redux/voicesSlice";
import getTTSDisabledVoicesV2 from "../voiceExternal/getTTSDisabledVoicesV2";

const getProjectVoiceDetails = async (projectID) => {
  try {
    let dispatch = store.dispatch;
    let res = await axiosCSPrivateInstance.get(
      `/tts_utils/getVoicesData/${projectID}`
    );

    if (res.data?.jsonStructure) {
      let apiVoiceData = JSON.parse(res.data?.jsonStructure) || [];
      const allVoicesShortname = apiVoiceData
        ?.flatMap((item) => item?.content)
        ?.map((item) => item?.voice);
      const uniqueShortnames = Array.isArray(allVoicesShortname)
        ? [...new Set(allVoicesShortname)]
        : [];
      console.log("uniqueShortnames", uniqueShortnames);
      let disabledVoices = [];
      if (uniqueShortnames?.length > 0) {
        const voicesStatus = await getTTSDisabledVoicesV2(
          uniqueShortnames.toString()
        );
        try {
          disabledVoices = voicesStatus
            ?.filter((data) => data?.statusId === 0)
            ?.map((data) => data.shortName);
          console.log("disabledVoices", disabledVoices);
        } catch (error) {}
      }
      let apiTimelineVoiceData =
        JSON.parse(res.data?.ttsTimelineStructure) || [];

      let checkTimelineOverlapAndReturnTimelineObj = updateTTSTimelineMeta(
        apiVoiceData,
        apiTimelineVoiceData
      );
      dispatch(
        SET_VOICE_META({
          disabledVoices: disabledVoices,
          selectedVoices: apiVoiceData,
          TTSTimelineVoicesMP3: checkTimelineOverlapAndReturnTimelineObj,
        })
      );

      let { brandMeta } = getCSUserMeta();
      // console.log(
      //   "apiVoiceData",
      //   apiVoiceData?.flatMap((data) => data?.content)
      // );
      // console.log(
      //   "pendingData",
      //   apiVoiceData
      //     ?.flatMap((data) => data?.content)
      //     ?.filter((data) => {
      //       if (brandMeta?.profanity) {
      //         return (
      //           data?.status === TTS_STATUS.STARTED ||
      //           data?.profanityStatus === PROFANITY_STATUS.STARTED
      //         );
      //       } else {
      //         return data?.status === TTS_STATUS.STARTED;
      //       }
      //     })
      // );

      let inProccessTTSUUIDS =
        apiVoiceData
          ?.flatMap((data) => data?.content)
          ?.filter((data) => {
            if (brandMeta?.profanity) {
              return (
                data?.status === TTS_STATUS.STARTED ||
                data?.profanityStatus === PROFANITY_STATUS.STARTED
              );
            } else {
              return data?.status === TTS_STATUS.STARTED;
            }
          })
          .map((data) => data?.voiceUUID) || [];
      // console.log("inProccessTTSUUIDS", inProccessTTSUUIDS);

      dispatch(ADD_NEW_TTS_SCRIPT_IDS(inProccessTTSUUIDS));
    }
    return res.data;
  } catch (error) {
    console.log("getProjectVoiceDetails error :: ", error);
  }
};

export default getProjectVoiceDetails;
