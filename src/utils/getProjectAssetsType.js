import { useSelector } from "react-redux";
import { store } from "../reduxToolkit/store";
import getCSUserMeta from "./getCSUserMeta";

const getProjectAssetsType = () => {
  const { AIMusic, voices, video, auth, AIMusicStability } = store.getState();
  let isVoicesFound = voices?.TTSTimelineVoicesMP3?.length > 0;
  let isAIMusicFound =
    !!AIMusic?.selectedAIMusicDetails?.cue_id || AIMusic?.aiMusicGenerator?.id || AIMusicStability?.stabilityMP3TracksArr?.length > 0;
  let isVoiceFromVideo = video?.tXsplit === "0" && !!video?.tXId;
  let isMusicFromVideo = video?.tXsplit === "1" && !!video?.tXId;
  let isVideoFound = !!video?.uploadedVideoURL;
  let assetsTypeArr = [];
  if (auth?.appAccess?.AI_MUSIC) {
    if (isAIMusicFound) {
      assetsTypeArr.push("AI Music");
    } else if (isMusicFromVideo) {
      assetsTypeArr.push("Music");
    }
  }
  if (isVideoFound) {
    assetsTypeArr.push("Video");
  }
  if (auth?.appAccess?.AI_VOICE) {
    if (isVoicesFound) {
      assetsTypeArr.push("AI Voice");
    } else if (isVoiceFromVideo) {
      assetsTypeArr.push("Voice");
    }
  }
  return assetsTypeArr.length === 0 ? "" : assetsTypeArr.sort().join(" + ");
};

export default getProjectAssetsType;
