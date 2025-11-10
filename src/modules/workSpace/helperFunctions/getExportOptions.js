import { ReactComponent as AIMusic } from "../../../static/AI_music/AI_music.svg";
import { ReactComponent as Voice } from "../../../static/common/voice.svg";
import { ReactComponent as Music } from "../../../static/common/music.svg";
import { ReactComponent as Video } from "../../../static/common/video.svg";
import { ReactComponent as Script } from "../../../static/common/script.svg";

const getExportOptions = ({
  label,
  uploadedVideoURL,
  isVoicesFound,
  isAIMusicFound,
  isVoiceFromVideo,
  isMusicFromVideo,
  aiMusicProvider
}) => {
  const showStemOption = aiMusicProvider == "stability" ? false : true;
  let options = [
    uploadedVideoURL
      ? {
          label: "Final Mix",
          icon: (
            <Video
              fill={
                label === "Final Mix"
                  ? "var(--color-primary)"
                  : "var(--color-white)"
              }
              className="video_icon"
              width={"50px"}
              height={"50px"}
            />
          ),
          fileFormat: ["mp4", "mov"],
        }
      : null,
    isVoicesFound || isVoiceFromVideo
      ? {
          label: "Voice Only",
          icon: (
            <Voice
              fill={
                label === "Voice Only"
                  ? "var(--color-primary)"
                  : "var(--color-white)"
              }
              width={"50px"}
              height={"50px"}
            />
          ),
          // fileFormat: ["mp3", "wav", "stem"],
          fileFormat: ["mp3", "wav", ...((isVoicesFound && showStemOption) ? ["stem"] : [])],
        }
      : null,
    isAIMusicFound || isMusicFromVideo
      ? {
          label: "Music Only",
          icon: (
            <Music
              fill={
                label === "Music Only"
                  ? "var(--color-primary)"
                  : "var(--color-white)"
              }
              width={"50px"}
              height={"50px"}
            />
          ),

          fileFormat: ["mp3", "wav", ...((isAIMusicFound && showStemOption) ? ["stem"] : [])],
        }
      : null,
    (isVoicesFound || isVoiceFromVideo) && (isAIMusicFound || isMusicFromVideo)
      ? {
          label: "Voice & Music",
          icon: (
            <AIMusic
              fill={
                label === "Voice & Music"
                  ? "var(--color-primary)"
                  : "var(--color-white)"
              }
              width={"50px"}
              height={"50px"}
            />
          ),
          fileFormat: ["mp3", "wav"],
        }
      : null,
    isVoicesFound
      ? {
          label: "Script",
          icon: (
            <Script
              fill={
                label === "Script"
                  ? "var(--color-primary)"
                  : "var(--color-white)"
              }
              width={"50px"}
              height={"50px"}
            />
          ),
          fileFormat: ["pdf"],
        }
      : null,
  ];
  return options?.filter((data) => Boolean(data)) || [];
};

export default getExportOptions;
