import React, { useEffect, useState } from "react";
import { VideoPreview } from "../VideoPreview/VideoPreview";
import { MusicStyleSelector } from "../MusicStyleSelector/MusicStyleSelector";
import "./AITrackCreationWithTags.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import uploadProjectVideoAndSplitAudio from "../../services/videoDB/uploadProjectVideoAndSplitAudio";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import { RESET_AI_MUSIC_META, SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import removeProjectAIMusic from "../../services/AIMusicDB/removeProjectAIMusic";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import b64toBlob from "../../../../utils/b64toBlob";
import _ from "lodash";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";

const AITrackCreationWithTags = () => {
  const dispatch = useDispatch()
  let location = useLocation();
  const navigate = useNavigate();
  const { projectID } = useSelector((state) => state.projectMeta);
  const { videoNavigationTo, coverImage, uploadedVideoBlobURL } = useSelector((state) => state.video);
  const { cueID, aiMusicGeneratorOption } = useSelector((state) => state.AIMusic);
  const { VideoURL = "", fileSource = {}, meta = {} } = location?.state || {};
  const [projectDuration, setProjectDuration] = useState(0);
  const [retain, setRetain] = useState(false);
  const [FileSource, SetFileSource] = useState("");
  const [vidSource, setVidSource] = useState("");
  const [isVideoHasAudio, setIsVideoHasAudio] = useState(null);
  const [processPercent, setProcessPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  // checked audio=false

  const UploadVideoAndSplitAudio = ({
    split,
    mute,
    selectAudio,
    retention,
    avoidNavigationOnSuccess = false
  }) => {
    console.log('called')
    setLoading(true);
    var formdata = new FormData();
    formdata.append("file", FileSource);
    formdata.append("projectID", +projectID);
    formdata.append("split", split);
    formdata.append("mute", mute);
    const configMeta = {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProcessPercent(percentage);
      },
    };
    uploadProjectVideoAndSplitAudio({
      formdata,
      configMeta,
      onSuccess: (videoResponse) => {
        trackExternalAPICalls({
          url: videoResponse?.request?.responseURL,
          requestData: JSON.stringify({
            fileMeta: _.assign(meta, { duration: +projectDuration }),
            projectID: +projectID,
            duration: +projectDuration,
            split: split,
            mute: mute,
          }),
          serviceBy: "Self",
          usedFor: "Video Upload",
          statusCode: videoResponse?.status,
          statusMessage: videoResponse?.statusText,
        });
        if (selectAudio === "AudioOn") {
          dispatch(
            SET_VIDEO_META({
              tXStatus: videoResponse?.data?.taxonomyStatus,
              tXsplit: split.toString(),
              tXfilePath: null,
              tXId: videoResponse?.data?.taxonomyId,
              videoNavigationTo: getWorkSpacePath(projectID, cueID),
            })
          );

          if (retention === "Voice") {
            const voiceMeta = {
              projectId: projectID,
              jsonStructure: [],
              ttsTimelineStructure: [],
            };
            console.log('first')
            updateVoiceMeta({
              voiceMeta,
              onSuccess: () => {
                dispatch(RESET_VOICE_META());
                onVideoUploadSuccess(
                  videoResponse?.data,
                  selectAudio,
                  retention,
                  avoidNavigationOnSuccess
                );
              },
            });
          } else if (retention === "Music") {
            removeProjectAIMusic({
              projectID,
              onSuccess: () => {
                dispatch(RESET_AI_MUSIC_META());
                // console.log(
                //   "videoNavigationTo",
                //   getWorkSpacePath(projectID, null)
                // );
                console.log('second')
                onVideoUploadSuccess(
                  videoResponse?.data,
                  selectAudio,
                  retention,
                  avoidNavigationOnSuccess
                );
                dispatch(
                  SET_VIDEO_META({
                    videoNavigationTo: getWorkSpacePath(projectID, null),
                  })
                );
              },
            });
          }
        } else {
          onVideoUploadSuccess(videoResponse?.data, selectAudio, retention, avoidNavigationOnSuccess);
        }
      },
      onError: (error) => {
        trackExternalAPICalls({
          url: (error?.config?.baseURL || "") + error?.config?.url,
          requestData: JSON.stringify({
            fileMeta: _.assign(meta, { duration: +projectDuration }),
            projectID: +projectID,
            duration: +projectDuration,
            split: split,
            mute: mute,
          }),
          serviceBy: "self",
          usedFor: "Video Upload",
          statusCode: error?.response?.status,
          statusMessage: error?.message,
        });
        console.log("Error Uploading Video", error);
        setLoading(false);
        // dispatch(RESET_TTS_TIMELINE_VOICES());
        navigate(videoNavigationTo);
        // setSubmitting(false);
      },
    });
  };

  const onVideoUploadSuccess = (res, selectAudio, retention, avoidNavigationOnSuccess) => {
    let projectMeta = {
      duration: +projectDuration,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        const url = window.URL.createObjectURL(new Blob([FileSource]));
        console.log("onVideoUploadSuccess")
        dispatch(
          SET_VIDEO_META({
            uploadedVideoURL: res?.FileName || "",
            uploadedVideoBlobURL: url || "",
            isVideoUploaded: true,
          })
        );
        dispatch(
          SET_PROJECT_META({
            projectDurationInsec: +projectDuration,
          })
        );
        let thumbnailsArr = [];
        generateVideoThumbnails(FileSource, 20).then((thumbnails) => {
          if (!coverImage && thumbnails?.length > 0) {
            let thumbnailToSave = thumbnails?.[Math.round(20 / 2)];
            saveCoverImage({
              projectID,
              base64ImageUrl: thumbnailToSave,
            });
          }
          thumbnails.forEach((thumbnail) => {
            const parts = thumbnail.split(";base64,");
            // Hold the content type
            const contentType = parts[0].split(":")[1];
            // Decode Base64 string
            const b64Data = parts[1];
            var blob = b64toBlob(b64Data, contentType);
            var blobUrl = URL.createObjectURL(blob);
            thumbnailsArr.push(blobUrl);
          });
          dispatch(
            SET_VIDEO_META({
              thumbnails: thumbnailsArr.slice(0, 20),
            })
          );
        });
        setLoading(false);
        // dispatch(RESET_TTS_TIMELINE_VOICES());
        setTimeout(() => {
          if (!avoidNavigationOnSuccess) {
            if (selectAudio === "AudioOn") {
              // console.log(
              //   "retention, projectID, cueID****123",
              //   retention,
              //   projectID,
              //   cueID
              // );
              if (retention === "Music") {
                navigate(getWorkSpacePath(projectID, null));
              } else {
                navigate(getWorkSpacePath(projectID, cueID));
              }
            } else {
              console.log("videoNavigationTo****", videoNavigationTo);
              navigate(videoNavigationTo);
            }
          }
        }, 250);
      },
    });
  };

  const hasAudio = (video) => {
    if (!video) return null;
    return (
      video?.mozHasAudio ||
      Boolean(video?.webkitAudioDecodedByteCount) ||
      Boolean(video?.audioTracks && video?.audioTracks?.length)
    );
  };


  useEffect(() => {
    SetFileSource((prev) => {
      return JSON.stringify(prev) === JSON.stringify(fileSource) ? prev : fileSource;
    });

    setVidSource((prev) => (prev === VideoURL ? prev : VideoURL));
  }, [VideoURL, fileSource]);

  // unchecked
  // split:0 voice
  // mute:1 true

  // checked
  // split:0 voice
  // mute:0 false
  return (
    <div className="AITrackCreationWithTags_container">
      <div>
        <div className="card_icon">
          <IconWrapper icon="AIMusic" />
        </div>
        {
          (VideoURL || uploadedVideoBlobURL) &&
          aiMusicGeneratorOption === "tags" &&
          <div className="VideoPreview_wrapper">
            <VideoPreview
              videoUrl={vidSource}
              filename={meta?.name}
              setProjectDuration={setProjectDuration}
              projectDuration={projectDuration}
              retain={retain}
              setRetain={setRetain}
              hasAudio={hasAudio}
              setIsVideoHasAudio={setIsVideoHasAudio}
              setVidSource={setVidSource}
              FileSourc={FileSource}
              duration="00:01:40"
              thumbnailUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6wEZnUNWTVAUFXcUHedsXdJGdfJPI2.png"
            />
          </div>
        }
      </div>
      <MusicStyleSelector
        VideoURL={VideoURL}
        uploadVideo={
          () => {
            UploadVideoAndSplitAudio({
              split: 0,
              mute: retain ? 0 : 1,
              retention: "Voice",
              selectAudio: retain ? "AudioOn" : "AudioOff",
              avoidNavigationOnSuccess: true
            })
            dispatch(
              SET_AI_MUSIC_META({
                aiMusicGenerator: {
                  id: null,
                  status: null,
                  projectFlow: "tags",
                }
              })
            )
          }
        }
      />
    </div >
  );
};

export default AITrackCreationWithTags;
