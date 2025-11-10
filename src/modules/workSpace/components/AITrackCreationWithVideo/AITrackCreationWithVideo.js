import React, { useEffect, useState } from "react";
import { VideoPreview } from "../VideoPreview/VideoPreview";
import "./AITrackCreationWithVideo.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player";
import showNotification from "../../../../common/helperFunctions/showNotification";
import formatTime from "../../../../utils/formatTime";
import _ from "lodash";
import uploadProjectVideoAndSplitAudio from "../../services/videoDB/uploadProjectVideoAndSplitAudio";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import removeProjectAIMusic from "../../services/AIMusicDB/removeProjectAIMusic";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import b64toBlob from "../../../../utils/b64toBlob";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import aiAnalysisApiRequest from "../../services/AiAnalysisApiRequest/aiAnalysisApiRequest";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";
import NavStrings from "../../../../routes/constants/NavStrings";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import { FormattedMessage } from "react-intl";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import ProgressBarWrapper from "../../../../branding/componentWrapper/ProgressBarWrapper";
import { initAIAnalysis } from "../../helperFunctions/initAIAnalysis";
import { getAIAnalysisStatus } from "../../helperFunctions/getAIAnalysisStatus";
import { useConfig } from "../../../../customHooks/useConfig";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { initVideoBreifAIAnalysisStability } from "../../helperFunctions/initVideoBreifAIAnalysisStability";
import { SET_AI_MUSIC_Stability_META } from "../../redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../redux/AITrackStabilitySlice";

const AITrackCreationWithVideo = () => {
  let location = useLocation();
  const navigate = useNavigate();
  let dispatch = useDispatch();
  let param = useParams()
  const { VideoURL = "", fileSource = {}, meta = {} } = location?.state || {};
  const { projectID, projectDurationInsec } = useSelector((state) => state.projectMeta);
  const { appAccess } = useSelector((state) => state.auth);
  const { cueID, aiMusicGeneratorOption, aiMusicGeneratorProgress } =
    useSelector((state) => state.AIMusic);
  const { videoNavigationTo, coverImage } = useSelector((state) => state.video);
  const [showPermission, setPermission] = useState(false);
  const [FileSource, SetFileSource] = useState();
  const [vidSource, setVidSource] = useState();
  const [projectDuration, setProjectDuration] = useState(0);
  const [isVideoHasAudio, setIsVideoHasAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retain, setRetain] = useState(false);
  const [pollingID, setPollingID] = useState(null);
  const [pollingModal, setPollingModal] = useState(false);
  const [loaderForProcedding, setLoaderForProcedding] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const { config, jsonConfig } = useConfig();
  const [confirmation, setConfirmation] = useState(false)
  const { brandMeta } = getCSUserMeta();
  const { stabilityMP3TracksArr, latestFiledataStability } = useSelector((state) => state.AIMusicStability);
  const { stabilityArr } = useSelector((state) => state.AITrackStability);


  console.log('location?.state', location?.state)
  const onCancelClick = () => {
    navigate(NavStrings?.UPLOAD_VIDEO, { state: { videoUpload: "video" } });
  };

  const hasAudio = (video) => {
    if (!video) return null;
    return (
      video?.mozHasAudio ||
      Boolean(video?.webkitAudioDecodedByteCount) ||
      Boolean(video?.audioTracks && video?.audioTracks?.length)
    );
  };

  const video = document.querySelector(".thumbnail_container video");

  const isAudioAvailable = hasAudio(video);

  const UploadVideoForAiAnalysis = ({
    split,
    mute,
    selectAudio,
    retention,
    aiAnalysis,
  }) => {
    // dispatch(SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 }));
    if (!pollingModal) setPollingModal(true);
    setLoading(true);
    setLoaderForProcedding(true);

    const formdata = new FormData();
    formdata.append("file", FileSource);
    formdata.append("projectID", +projectID);
    formdata.append("split", split);
    formdata.append("mute", mute);
    formdata.append("aiAnalysis", aiAnalysis);

    const configMeta = {
      onUploadProgress: ({ loaded, total }) =>
        setProcessPercent(Math.round((loaded * 100) / total)),
    };

    const handleError = (error, message) => {
      console.error(message, error);
      trackExternalAPICalls({
        url: (error?.config?.baseURL || "") + error?.config?.url,
        requestData: JSON.stringify({
          fileMeta: _.assign(meta, { duration: +projectDuration }),
          projectID: +projectID,
          duration: +projectDuration,
          split,
          mute,
        }),
        serviceBy: "Self",
        usedFor: "Video Upload",
        statusCode: error?.response?.status,
        statusMessage: error?.message,
      });
      setLoading(false);
      dispatch(RESET_LOADING_STATUS());
      setLoaderForProcedding(false);
      // setPollingModal(false)
    };

    uploadProjectVideoAndSplitAudio({
      formdata,
      configMeta,
      onSuccess: (videoResponse) => {
        const { aiAnalysisFileName, taxonomyStatus, taxonomyId } =
          videoResponse?.data;
        // const requestData = {
        //   projectID,
        //   fileName: aiAnalysisFileName,
        //   mediatype: 1,
        //   inputText: aiAnalysisFileName,
        // };

        // aiAnalysisRequest(requestData);
        let requestData;

        if (brandMeta?.aiMusicProvider === "stability") {
          requestData = {
            projectId: projectID,
            sentFileName: aiAnalysisFileName,
            type: 1,
            duration: projectDurationInsec > 180 ? 180 : projectDurationInsec,
            prompt: null,
          };
          console.log("7895234")
          stabilityAIAnalysisRequest(requestData);
        } else {
          requestData = {
            projectID,
            fileName: aiAnalysisFileName,
            mediatype: 1,
            inputText: aiAnalysisFileName,
          };
          aiAnalysisRequest(requestData);
        }

        trackExternalAPICalls({
          url: videoResponse?.request?.responseURL,
          requestData: JSON.stringify({
            fileMeta: _.assign(meta, { duration: +projectDuration }),
            projectID,
            duration: +projectDuration,
            split,
            mute,
          }),
          serviceBy: "Self",
          usedFor: "Video Upload",
          statusCode: videoResponse?.status,
          statusMessage: videoResponse?.statusText,
        });

        if (selectAudio === "AudioOn") {
          dispatch(
            SET_VIDEO_META({
              tXStatus: taxonomyStatus,
              tXsplit: split.toString(),
              tXfilePath: null,
              tXId: taxonomyId,
              videoNavigationTo: getWorkSpacePath(projectID, cueID),
            })
          );

          if (retention === "Voice") {
            updateVoiceMeta({
              voiceMeta: {
                projectId: projectID,
                jsonStructure: [],
                ttsTimelineStructure: [],
              },
              onSuccess: () => {
                dispatch(RESET_VOICE_META());
                onVideoUploadSuccess(
                  videoResponse?.data,
                  selectAudio,
                  retention
                );
              },
            });
          } else if (retention === "Music") {
            removeProjectAIMusic({
              projectID,
              onSuccess: () => {
                dispatch(RESET_AI_MUSIC_META());
                onVideoUploadSuccess(
                  videoResponse?.data,
                  selectAudio,
                  retention
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
          onVideoUploadSuccess(videoResponse?.data, selectAudio, retention);
        }
      },
      onError: (error) => {
        handleError(error, "Error Uploading Video");
        setPollingModal(false);
      },
    });
  };

  const aiAnalysisRequest = (data) => {
    initAIAnalysis({
      data,
      onSuccess: (response) => {
        if (!pollingModal) setPollingModal(true);
        setLoaderForProcedding(false);
      },
      onError: (error) => {
        // setPollingModal(false);
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  const createBlobURLS = async (fileNames) => {
    // Fetch all files as blobs
    try {
      const fileRequests = fileNames.map((file) =>
        axiosCSPrivateInstance.get(
          `/stability/GetMediaFile/${projectID}/${file}`,
          { responseType: "blob" }
        )
      );

      // Wait for all requests to finish
      const results = await Promise.all(fileRequests);

      // Create object URLs for each blob
      const objectURLArr = results.map((res) => URL.createObjectURL(res.data));
      console.log("Fetched all Stability MP3 files:", objectURLArr);

      // Dispatch to redux
      dispatch(
        SET_AI_Track_Stability_META({ stabilityArr: [...stabilityArr, ...objectURLArr] })
      );
      dispatch(
        SET_AI_MUSIC_Stability_META({ stabilityMP3TracksArr: [...stabilityMP3TracksArr, fileNames], stabilityLoading: false })
      );
      setLoading(false);
    } catch (e) {
      console.log("Error while fetching stability mp3 files", e)
      setLoading(false);
    }
  };

  const stabilityAIAnalysisRequest = (data) => {
    setLoading(true);
    console.log("789456231-12346")
    initVideoBreifAIAnalysisStability({
      data,
      projectID,
      param,
      latestFiledataStability,
      pollingDataFiles: (details) => {
        dispatch(
          SET_AI_MUSIC_Stability_META({ latestFiledataStability: details, stabilityMP3TracksArr: [...stabilityMP3TracksArr], stabilityLoading: true })
        );
        setLoaderForProcedding(false);
        dispatch(RESET_LOADING_STATUS());
      },
      onSuccess: (urls) => {
        createBlobURLS(urls);
        setLoaderForProcedding(false);
        dispatch(RESET_LOADING_STATUS());
      },
      onError: () => {
        setLoading(false);
        console.log("Stability AI Music Generation Error");
      },
      onFinally: () => {
        setLoading(false);
        setLoaderForProcedding(false);
        dispatch(RESET_LOADING_STATUS());
      }
    });
  };

  const onVideoUploadSuccess = (res, selectAudio, retention) => {
    const projectMeta = { duration: +projectDuration };

    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        const url = URL.createObjectURL(new Blob([FileSource]));

        dispatch(
          SET_VIDEO_META({
            uploadedVideoURL: res?.FileName || "",
            uploadedVideoBlobURL: url || "",
            isVideoUploaded: true,
          })
        );

        dispatch(SET_PROJECT_META({ projectDurationInsec: +projectDuration }));

        generateVideoThumbnails(FileSource, 20).then((thumbnails) => {
          if (!coverImage && thumbnails?.length) {
            saveCoverImage({
              projectID,
              base64ImageUrl: thumbnails[Math.floor(thumbnails.length / 2)],
            });
          }

          const thumbnailsArr = thumbnails.map((thumbnail) => {
            const [meta, b64Data] = thumbnail.split(";base64,");
            const contentType = meta.split(":")[1];
            return URL.createObjectURL(b64toBlob(b64Data, contentType));
          });

          dispatch(SET_VIDEO_META({ thumbnails: thumbnailsArr.slice(0, 20) }));
        });
        // setPollingModal(false)
      },
    });
  };

  useEffect(() => {
    SetFileSource((prev) => {
      return JSON.stringify(prev) === JSON.stringify(fileSource)
        ? prev
        : fileSource;
    });

    setVidSource((prev) => (prev === VideoURL ? prev : VideoURL));
  }, [VideoURL, fileSource]);

  const stopPolling = (interval) => {
    clearInterval(interval);
    // dispatch(RESET_LOADING_STATUS());
  };
  console.log("aiMusicGeneratorProgress", aiMusicGeneratorProgress);

  useEffect(() => {
    if (!aiMusicGeneratorProgress?.id) return;
    getAIAnalysisStatus({
      analysisId: aiMusicGeneratorProgress?.id,
      stopPollingRequest: () => {
        stopPolling(interval);
      },
      navigate,
      setPollingModal,
      config,
      jsonConfig,
    });
    const interval = setInterval(() => {
      getAIAnalysisStatus({
        analysisId: aiMusicGeneratorProgress?.id,
        stopPollingRequest: () => {
          stopPolling(interval);
        },
        navigate,
        setPollingModal,
        config,
        jsonConfig,
      });
    }, 5000); // Retry every 5 seconds

    return () => stopPolling(interval); // Cleanup on unmount
  }, [aiMusicGeneratorProgress?.id]);

  return (
    <div className="AITrackCreationWithVideo_container">
      {/* <IconWrapper icon="Video" /> */}
      <h1>Upload Video</h1>
      <p className={"note"}>
        * The length of your project will be automatically set to the length of
        the video.
      </p>
      <div className="thumbnail_container">
        <ReactPlayer
          className="AITrackCreationWithVideo_video_thumbnail"
          id="test"
          width="100%"
          height="100%"
          url={vidSource}
          // muted={values.selectAudio === "AudioOff"}
          onDuration={(duration) => {
            if (!isNaN(duration)) {
              setProjectDuration(duration);
            }
          }}
          onReady={(e) => {
            const video = document.querySelector(".thumbnail_container video");
            const hasAudioInVideo = hasAudio(video);
            setIsVideoHasAudio(hasAudioInVideo);
            if (!hasAudioInVideo) {
              showNotification("WARNING", "Your video has no audio");
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
                controlsList: "nodownload noplaybackrate noremoteplayback",
                disablePictureInPicture: true,
              },
            },
          }}
        />
        <span className="video_duration">
          {projectDuration && formatTime(projectDuration)}
        </span>
      </div>
      <div className={"retainCheckbox_container"}>
        <CheckboxWrapper
          label="Retain Voice"
          className={"retainCheckbox"}
          checked={retain}
          disabled={!isAudioAvailable}
          onChange={(e) => {
            setRetain(e?.target?.checked);
          }}
        />
      </div>
      <div className={"accept_Checkbox_container"}>
        <CheckboxWrapper
          label="I comply with the video terms and conditions, and have editing right to it"
          className={"acceptCheckbox"}
          checked={confirmation}
          onChange={(e) => {
            setConfirmation(e?.target?.checked);
          }}
        />
      </div>
      {!isAudioAvailable && (
        <p style={{ color: "red", fontSize: "12px" }}>No voice to retain</p>
      )}
      <div className="AITrackCreationWithVideo_btn_container">
        <ButtonWrapper onClick={onCancelClick}>Cancel</ButtonWrapper>
        <ButtonWrapper
          type="submit"
          variant="filled"
          disabled={loading || !confirmation}
          onClick={() =>
            UploadVideoForAiAnalysis({
              split: 0,
              mute: retain ? 0 : 1,
              retention: "Voice",
              selectAudio: retain ? "AudioOn" : "AudioOff",
              aiAnalysis: true,
            })
          }
        >
          Generate
        </ButtonWrapper>
      </div>

      {loaderForProcedding ? (
        <div className="overlay">
          <CustomLoader
            processPercent={processPercent}
            appendLoaderText={"Uploading video now!"}
          />
        </div>
      ) : (
        <ModalWrapper isOpen={pollingModal} className="pollingModal-dialog">
          <>
            <p className="pollingModal_header">
              <FormattedMessage
                id={"workspace.AIMusicGenerator.ProcessingText"}
              />
            </p>
            <div className="pollingModal_btn">
              <ButtonWrapper
                variant="filled"
                onClick={() => navigate(NavStrings?.PROJECTS)}
              >
                Okay
              </ButtonWrapper>
            </div>
          </>
        </ModalWrapper>
      )}

    </div>
  );
};

export default AITrackCreationWithVideo;
