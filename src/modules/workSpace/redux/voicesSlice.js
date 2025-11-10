import { createSelector, createSlice } from "@reduxjs/toolkit";
import { TTS_STATUS } from "../constants/TTSStatus";
import { v4 as uuidv4 } from "uuid";
import roundUpToDecimal from "../../../utils/roundUpToDecimal";
import { ElevenLabsVoiceProvider } from "../constants/VoiceProviders";
import updateTTSTimelineMeta from "../helperFunctions/updateTTSTimelineMeta";
import { PROFANITY_STATUS } from "../constants/profanityStatus";
import { concat, union, intersection } from "lodash";

const initialState = {
  selectedVoices: [],
  disabledVoices: [],
  TTSTimelineVoicesMP3: [],
  isVoiceListModalOpen: false,
  voiceListModalAction: "ADD_VOICE",
  isDictModalOpen: false,
  isUpdateProjectLengthSameAsTTSVoicesModalOpen: false,
  getUpdatedData: false,
  replaceVoiceMeta: null,
  isTTSProcessing: false,
  isTTSVoicePlaying: false,
  pendingTTSScriptIds: [],
};

const voicesSlice = createSlice({
  name: "VOICES",
  initialState,
  reducers: {
    ADD_VOICE: (state, action) => {
      state.selectedVoices?.splice(
        state.selectedVoices?.length,
        0,
        action.payload
      );
    },
    UPDATE_TTS_STATUS: (state, action) => {
      action.payload.forEach((data) => {
        // console.log("data", data);
        let obj = state.selectedVoices
          ?.flatMap((item) => item?.content)
          ?.find((item) => item?.voiceUUID === data.scriptId);
        // console.log("obj", JSON.stringify(obj, null, 2));
        if (obj) {
          obj.status = data?.ttsStatus;
          if (data?.profanity) {
            obj.profanityStatus = data?.profanityStatus;
          }
        }
      });
      state.getUpdatedData = !state.getUpdatedData;
    },
    UPDATE_TTS_PROFANITY_META: (state, action) => {
      let { response, profanity } = action.payload;

      // update tts meta
      let completedTTS =
        response?.filter((data) => data.status === TTS_STATUS.COMPLETED) || [];

      let failedTTS =
        response?.filter((data) =>
          [
            TTS_STATUS.FAILED,
            TTS_STATUS.ERROR,
            TTS_STATUS.VOICE_DISABLED,
          ].includes(data.status)
        ) || [];

      console.log("completedTTS", completedTTS);
      console.log("failedTTS", failedTTS);

      let isTTSDataUpdate = false;
      if (completedTTS?.length > 0) {
        completedTTS.forEach((tts) => {
          let obj = state.selectedVoices
            ?.flatMap((data) => data?.content)
            ?.find((data) => data?.voiceUUID === tts.scriptId);

          if (obj && obj?.status !== TTS_STATUS.COMPLETED) {
            // console.log("TTS completedTTS updated...");
            isTTSDataUpdate = true;
            obj.status = TTS_STATUS.COMPLETED;
            obj.mp3 = tts.mp3Path;
            obj.duration = roundUpToDecimal(tts.duration) || 0;
          }
        });
      }

      if (failedTTS?.length > 0) {
        failedTTS.forEach((tts) => {
          console.log("tts", tts);
          let obj = state.selectedVoices
            ?.flatMap((item) => item?.content)
            ?.find((item) => item?.voiceUUID === tts?.scriptId);
          console.log("obj", JSON.stringify(obj));
          if (
            obj &&
            ![
              TTS_STATUS.FAILED,
              TTS_STATUS.ERROR,
              TTS_STATUS.VOICE_DISABLED,
            ].includes(obj?.status)
          ) {
            // console.log("TTS failedTTS updated...");
            isTTSDataUpdate = true;
            obj.status = tts?.status;
            obj.statusMessage = tts?.statusMessage || "";
            obj.profanityStatus = tts?.status || "";
            console.log("obj after update", JSON.stringify(obj));

            if (tts?.status === TTS_STATUS.VOICE_DISABLED) {
              let disabledVoices = state.selectedVoices
                ?.flatMap((item) => item?.content)
                ?.filter(
                  (item) =>
                    item?.voice === obj?.voice &&
                    item.status !== TTS_STATUS.VOICE_DISABLED
                );
              if (!state.disabledVoices.includes(obj?.voice)) {
                state.disabledVoices.push(obj?.voice);
              }
              console.log("disabledVoices", disabledVoices);
              if (disabledVoices.length > 0) {
                disabledVoices.forEach((tts) => {
                  tts.status = TTS_STATUS.VOICE_DISABLED;
                  tts.profanityStatus = PROFANITY_STATUS.VOICE_DISABLED || "";
                });
              }
            }
          }
        });
      }

      let completedOrFailedTTSScriptIds =
        concat(completedTTS, failedTTS)?.map((item) => item.scriptId) || [];

      console.log(
        "completedOrFailedTTSScriptIds",
        completedOrFailedTTSScriptIds
      );
      console.log(
        "pendingTTSScriptIds",
        JSON.stringify(state.pendingTTSScriptIds)
      );
      if (!profanity) {
        // remove completedOrFailedTTSScriptIds from pendingTTSScriptIds
        state.pendingTTSScriptIds = state.pendingTTSScriptIds.filter(
          (item) => !completedOrFailedTTSScriptIds.includes(item)
        );
      }

      // update profanity meta
      let isProfanityDataUpdate = false;
      if (profanity) {
        let completedProfanity =
          response?.filter(
            (data) => data.profanityStatus === PROFANITY_STATUS.COMPLETED
          ) || [];

        let failedProfanity =
          response?.filter((data) =>
            [
              PROFANITY_STATUS.FAILED,
              PROFANITY_STATUS.ERROR,
              PROFANITY_STATUS.VOICE_DISABLED,
            ].includes(data.profanityStatus)
          ) || [];

        console.log("completedProfanity", completedProfanity);
        console.log("failedProfanity", failedProfanity);

        if (completedProfanity?.length > 0) {
          completedProfanity.forEach((profanity) => {
            let obj = state.selectedVoices
              ?.flatMap((data) => data?.content)
              ?.find((data) => data?.voiceUUID === profanity.scriptId);

            if (obj && obj?.profanityStatus !== PROFANITY_STATUS.COMPLETED) {
              // console.log("Profanity completedProfanity updated...");
              isProfanityDataUpdate = true;
              obj.profanityStatus = PROFANITY_STATUS.COMPLETED;
              obj.expletiveWordCount = profanity.expletiveWordCount;
              obj.expletiveWords = profanity.expletiveWords;
              obj.ampProfanity = profanity.ampProfanity;
            }
          });
        }

        if (failedProfanity?.length > 0) {
          failedProfanity.forEach((profanity) => {
            let obj = state.selectedVoices
              ?.flatMap((item) => item?.content)
              ?.find((item) => item?.voiceUUID === profanity?.scriptId);

            if (
              obj &&
              ![
                PROFANITY_STATUS.FAILED,
                PROFANITY_STATUS.ERROR,
                PROFANITY_STATUS.VOICE_DISABLED,
              ].includes(obj?.status)
            ) {
              // console.log("Profanity failedProfanity updated...");
              isProfanityDataUpdate = true;
              obj.profanityStatus = PROFANITY_STATUS.FAILED;
            }
          });
        }

        let completedOrFailedProfanityScriptIds =
          concat(completedProfanity, failedProfanity)?.map(
            (item) => item.scriptId
          ) || [];

        console.log(
          "completedOrFailedTTSScriptIds",
          completedOrFailedTTSScriptIds
        );
        console.log(
          "completedOrFailedProfanityScriptIds",
          completedOrFailedProfanityScriptIds
        );
        let proccessedTTSAndProfanityScriptIds = intersection(
          completedOrFailedTTSScriptIds,
          completedOrFailedProfanityScriptIds
        );
        // let proccessedTTSAndProfanityScriptIds = union(
        //   completedOrFailedTTSScriptIds,
        //   completedOrFailedProfanityScriptIds
        // );
        console.log(
          "proccessedTTSAndProfanityScriptIds",
          proccessedTTSAndProfanityScriptIds
        );
        // remove proccessedTTSAndProfanityScriptIds from pendingTTSScriptIds
        state.pendingTTSScriptIds = state.pendingTTSScriptIds.filter(
          (item) => !proccessedTTSAndProfanityScriptIds.includes(item)
        );
      }

      console.log("isTTSDataUpdate", isTTSDataUpdate);
      console.log("isProfanityDataUpdate", isProfanityDataUpdate);

      if (isTTSDataUpdate || isProfanityDataUpdate) {
        console.log("UPDATE getUpdatedData**");
        //will set voices on timeline
        state.TTSTimelineVoicesMP3 = updateTTSTimelineMeta(
          state.selectedVoices,
          state.TTSTimelineVoicesMP3
        );
        //will rerender voice tab
        state.getUpdatedData = !state.getUpdatedData;
      }
    },
    ADD_NEW_TTS_SCRIPT_IDS: (state, action) => {
      state.pendingTTSScriptIds = [
        ...new Set([...state.pendingTTSScriptIds, ...(action.payload || [])]),
      ];
    },
    REMOVE_VOICE: (state, action) => {
      state.selectedVoices = state.selectedVoices
        ?.filter((voice, i) => i !== action.payload?.voiceIndex)
        ?.map((item, itemIndex) => {
          if (item) {
            return {
              ...item,
              content:
                item?.content?.map((contentItem) => ({
                  ...contentItem,
                  voiceIndex: itemIndex,
                })) || [],
            };
          } else {
            return;
          }
        });

      state.TTSTimelineVoicesMP3 = state.TTSTimelineVoicesMP3?.filter(
        (data) => data.mp3 !== action.payload?.mp3
      );
      state.pendingTTSScriptIds = state.pendingTTSScriptIds?.filter(
        (data) => data !== action.payload?.content?.[0]?.voiceUUID
      );
    },
    ADD_CONTENT: (state, action) => {
      state.selectedVoices[action.payload.voiceIndex].content =
        action.payload?.inputList;

      const removedTextBoxMp3 = action.payload?.removedTextBoxMp3;
      if (!!removedTextBoxMp3) {
        state.TTSTimelineVoicesMP3 = state.TTSTimelineVoicesMP3?.filter(
          (data) => data?.mp3 !== removedTextBoxMp3
        );
      }
      const removedTextBoxUUID = action.payload?.removedTextBoxUUID;
      if (!!removedTextBoxUUID) {
        state.pendingTTSScriptIds = state.pendingTTSScriptIds?.filter(
          (data) => data !== removedTextBoxUUID
        );
      }
    },
    ADD_SUBTEXT: (state, action) => {
      let { profanity } = action.payload;
      const lastContent =
        state.selectedVoices[state.selectedVoices?.length - 1]?.content;

      state.selectedVoices[state.selectedVoices?.length - 1].content =
        lastContent?.concat({
          content: "",
          voice: lastContent?.[0]?.voice,
          color: lastContent?.[0]?.color,
          gender: lastContent?.[0]?.gender,
          voiceProvider: lastContent?.[0]?.voiceProvider,
          mp3: "",
          ...(profanity && {
            expletiveWordCount: null,
            ampProfanity: null,
            expletiveWords: null,
            profanityStatus: PROFANITY_STATUS.NOT_STARTED,
            langCode: lastContent?.[0]?.langCode,
          }),
          artistName: lastContent?.[0]?.artistName,
          status: TTS_STATUS.NOT_STARTED,
          statusMessage: "",
          voiceUUID: uuidv4(),
          duration: 0,
          ...(lastContent?.[0]?.voiceProvider !== ElevenLabsVoiceProvider
            ? {
                speed: lastContent?.[0]?.speed || "1",
                pitch: lastContent?.[0]?.pitch || "1",
              }
            : {
                stability: lastContent?.[0]?.stability || "0.5",
                similarityBoost: lastContent?.[0]?.similarityBoost || "0.7",
                style: lastContent?.[0]?.style || "0",
                useSpeakerBoost: lastContent?.[0]?.useSpeakerBoost || true,
              }),
          speakingStyle: lastContent?.[0]?.speakingStyle || "general",
          index: lastContent?.length,
          voiceIndex: lastContent?.[0]?.voiceIndex,
        });
      state.getUpdatedData = !state.getUpdatedData;
    },
    UPDATE_TTS_TIMELINE_SLIDER_VALUES: (state, action) => {
      state.TTSTimelineVoicesMP3.forEach((element, index) => {
        if (action.payload?.[index] >= 0) {
          element.startPoint = roundUpToDecimal(action.payload?.[index]);
        }
      });
    },
    // UPDATE_TTS_VOICE_ENABLED_DISABLED_STATUS: (state, action) => {
    //   const voicesWithStatus = action.payload;
    //   voicesWithStatus.forEach((data) => {
    //     const currentVoices = state.selectedVoices
    //       ?.flatMap((item) => item?.content)
    //       ?.filter((item) => item?.voice === data?.voice);
    //     if (currentVoices.length > 0) {
    //       currentVoices.forEach((tts) => {
    //         tts.status = TTS_STATUS.VOICE_DISABLED;
    //       });
    //     }
    //   });
    // },
    SET_VOICE_META: (state, action) => {
      let voiceObj = action.payload;
      for (const key in voiceObj) {
        if (Object.hasOwnProperty.call(voiceObj, key)) {
          const element = voiceObj[key];
          state[key] = element;
        }
      }
    },
    RESET_VOICE_META: () => initialState,
  },
});

export const selectSelectedVoices = (state) =>
  state.voices?.selectedVoices || [];

export const selectFilteredDisabledVoiceList = createSelector(
  [selectSelectedVoices],
  (selectedVoices) =>
    selectedVoices
      ?.flatMap((item) => item?.content || [])
      ?.filter((voice) => voice?.status === TTS_STATUS.VOICE_DISABLED)
      ?.map((data) => data?.voice) || []
);

export default voicesSlice.reducer;
export const {
  ADD_VOICE,
  ADD_SUBTEXT,
  REMOVE_VOICE,
  UPDATE_TTS_STATUS,
  UPDATE_TTS_PROFANITY_META,
  ADD_NEW_TTS_SCRIPT_IDS,
  GET_PENDING_TTS,
  ADD_CONTENT,
  SET_SELECTED_VOICES,
  UPDATE_TTS_TIMELINE_SLIDER_VALUES,
  // UPDATE_TTS_VOICE_ENABLED_DISABLED_STATUS,
  SET_VOICE_META,
  RESET_VOICE_META,
} = voicesSlice.actions;
