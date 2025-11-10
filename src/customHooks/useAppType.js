import { useMemo } from "react";
// import { useConfig } from "./useConfig";
import { useSelector } from "react-redux";

export const APP_TYPES = {
  AI_MUSIC_AND_AIVOICE: "AI_MUSIC_AND_AI_VOICE",
  AI_VOICE: "AI_VOICE",
  AI_MUSIC: "AI_MUSIC",
};

const useAppType = () => {
  const { appAccess } = useSelector((state) => state.auth);

  let appType = useMemo(() => {
    let isAIVoiceEnabled = appAccess?.AI_VOICE;
    let isAIMusicEnabled = appAccess?.AI_MUSIC;

    if (isAIVoiceEnabled && isAIMusicEnabled) {
      return APP_TYPES.AI_MUSIC_AND_AIVOICE;
    } else if (isAIVoiceEnabled && !isAIMusicEnabled) {
      return APP_TYPES.AI_VOICE;
    } else if (!isAIVoiceEnabled && isAIMusicEnabled) {
      return APP_TYPES.AI_MUSIC;
    } else {
      return APP_TYPES.AI_MUSIC_AND_AIVOICE;
    }
  }, []);

  return { appType };
};

export default useAppType;
