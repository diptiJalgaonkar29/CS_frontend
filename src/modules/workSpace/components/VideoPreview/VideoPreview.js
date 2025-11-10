import ReactPlayer from "react-player";
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import "./VideoPreview.css";
import { useState } from "react";
import formatTime from "../../../../utils/formatTime";
import showNotification from "../../../../common/helperFunctions/showNotification";

export const VideoPreview = ({
  videoUrl,
  title,
  filename,
  setProjectDuration,
  projectDuration,
  retain,
  setRetain,
  hasAudio,
  setIsVideoHasAudio,
  setVidSource,
  FileSource

}) => {
  const video = document.querySelector(
    ".videoWrapper video"
  );
  const isAudioAvailable = hasAudio(video)

  return (
    <div className={"previewContainer"}>
      <div className={"videoWrapper"}>
        <ReactPlayer
          className="test"
          id="test"
          width="199px"
          height="118px"
          url={videoUrl}
          // muted={values.selectAudio === "AudioOff"}
          onDuration={(duration) => {
            if (!isNaN(duration)) {
              setProjectDuration(duration);
            }
          }}
          onReady={(e) => {
            const video = document.querySelector(
              ".videoWrapper video"
            );
            const hasAudioInVideo = hasAudio(video);
            setIsVideoHasAudio(hasAudioInVideo);
            if (!hasAudioInVideo) {
              showNotification(
                "WARNING",
                "Your video has no audio"
              );
            }
          }}
          onError={(e) => {
            const newBlobUrl = window.URL.createObjectURL(
              new Blob([FileSource])
            );
            setVidSource(newBlobUrl);
          }}
          controls
          config={{
            file: {
              attributes: {
                controlsList:
                  "nodownload noplaybackrate noremoteplayback",
                disablePictureInPicture: true,
              },
            },
          }}
        />
        <div className={"videoInfo"}>
          <div className={"videoTitle"}>{filename}</div>
          <div className={"videoTitle"}>{title}</div>
          <div className={"videoDuration"}>
            <p>Video Length</p>
            <p>{projectDuration && formatTime(projectDuration)}</p>
          </div>
          {/* <label className={"retainLabel"}>
            <input type="checkbox" className={"retainCheckbox"} />
            Retain Video
          </label> */}
          <CheckboxWrapper
            label="Retain Voice"
            className={"retainCheckbox"}
            checked={retain}
            disabled={!isAudioAvailable}
            onChange={(e) => {
              // updateVoiceMeta("useSpeakerBoost", e.target.checked, index);
              setRetain(e?.target?.checked)
            }}
          />
          {!isAudioAvailable && (<p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>No voice to retain</p>)}
        </div>
      </div>
      <p className={"note"}>
        * The length of your project will be automatically set to the length of
        the video.
      </p>
    </div>
  );
};
