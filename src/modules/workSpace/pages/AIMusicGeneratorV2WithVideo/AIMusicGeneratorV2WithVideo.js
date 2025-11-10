import React, { useEffect, useState } from "react";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import FileInputWrapper from "../../../../branding/componentWrapper/FileInputWrapper";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import _ from "lodash";
import "./AIMusicGeneratorV2WithVideo.css";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import b64toBlob from "../../../../utils/b64toBlob";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import { useDispatch, useSelector } from "react-redux";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import removeProjectAIMusic from "../../services/AIMusicDB/removeProjectAIMusic";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import uploadProjectVideoAndSplitAudio from "../../services/videoDB/uploadProjectVideoAndSplitAudio";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";
import { initAIAnalysis } from "../../helperFunctions/initAIAnalysis";
import { getAIAnalysisStatus } from "../../helperFunctions/getAIAnalysisStatus";
import { useConfig } from "../../../../customHooks/useConfig";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";

const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/quicktime", // for .mov
];

const validationSchema = Yup.object().shape({
  mediaFile: Yup.mixed()
    .nullable()
    .test("fileFormat", "Unsupported video format", (value) => {
      if (!value) return true; // allow empty file
      return SUPPORTED_VIDEO_FORMATS.includes(value.type);
    }),
  duration: Yup.number().required("Video duration is required"),
});

export default function AIMusicGeneratorV2WithVideo() {
  let dispatch = useDispatch();
  const navigate = useNavigate();

  const { projectID } = useSelector((state) => state.projectMeta);
  const { aiMusicGeneratorProgress } = useSelector((state) => state.AIMusic);
  const { videoNavigationTo, coverImage } = useSelector((state) => state.video);
  const [loading, setLoading] = useState(false);
  const [retain, setRetain] = useState(false);
  const [pollingID, setPollingID] = useState(null);
  const [pollingModal, setPollingModal] = useState(false);
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const { config, jsonConfig } = useConfig();

  const handleSubmit = (values) => {
    UploadVideoForAiAnalysis({
      split: 0,
      mute: retain ? 0 : 1,
      retention: "Voice",
      selectAudio: retain ? "AudioOn" : "AudioOff",
      aiAnalysis: true,
      values,
    });
  };

  const UploadVideoForAiAnalysis = ({
    split,
    mute,
    selectAudio,
    retention,
    aiAnalysis,
    values,
  }) => {
    console.log("values", values);
    if (!pollingModal) setPollingModal(true);
    setProcessStatus(true);
    const formdata = new FormData();
    formdata.append("file", values?.mediaFile);
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
          fileMeta: _.assign({}, { duration: values?.duration }),
          projectID: +projectID,
          duration: values?.duration,
          split,
          mute,
        }),
        serviceBy: "Self",
        usedFor: "Video Upload",
        statusCode: error?.response?.status,
        statusMessage: error?.message,
      });
      setProcessStatus(false);
    };

    uploadProjectVideoAndSplitAudio({
      formdata,
      configMeta,
      onSuccess: (videoResponse) => {
        const { aiAnalysisFileName, taxonomyStatus, taxonomyId } =
          videoResponse?.data;
        const requestData = {
          projectID,
          fileName: aiAnalysisFileName,
          mediatype: 1,
          inputText: aiAnalysisFileName,
        };

        aiAnalysisRequest(requestData);

        trackExternalAPICalls({
          url: videoResponse?.request?.responseURL,
          requestData: JSON.stringify({
            fileMeta: _.assign({}, { duration: values?.duration }),
            projectID,
            duration: values?.duration,
            split,
            mute,
          }),
          serviceBy: "Self",
          usedFor: "Video Upload",
          statusCode: videoResponse?.status,
          statusMessage: videoResponse?.statusText,
        });

        if (selectAudio === "AudioOn") {
          // dispatch(
          //   SET_VIDEO_META({
          //     tXStatus: taxonomyStatus,
          //     tXsplit: split.toString(),
          //     tXfilePath: null,
          //     tXId: taxonomyId,
          //     videoNavigationTo: getWorkSpacePath(projectID, cueID),
          //   })
          // );
          // if (retention === "Voice") {
          //   updateVoiceMeta({
          //     voiceMeta: {
          //       projectId: projectID,
          //       jsonStructure: [],
          //       ttsTimelineStructure: [],
          //     },
          //     onSuccess: () => {
          //       dispatch(RESET_VOICE_META());
          //       onVideoUploadSuccess(
          //         videoResponse?.data,
          //         selectAudio,
          //         retention,
          //         values
          //       );
          //     },
          //   });
          // } else if (retention === "Music") {
          //   removeProjectAIMusic({
          //     projectID,
          //     onSuccess: () => {
          //       dispatch(RESET_AI_MUSIC_META());
          //       onVideoUploadSuccess(
          //         videoResponse?.data,
          //         selectAudio,
          //         retention,
          //         values
          //       );
          //       dispatch(
          //         SET_VIDEO_META({
          //           videoNavigationTo: getWorkSpacePath(projectID, null),
          //         })
          //       );
          //     },
          //   });
          // }
        } else {
          onVideoUploadSuccess(
            videoResponse?.data,
            selectAudio,
            retention,
            values
          );
        }
      },
      onError: (error) => {
        handleError(error, "Error Uploading Video");
        setPollingModal(false);
        setProcessStatus(false);
      },
    });
  };

  const aiAnalysisRequest = (data) => {
    initAIAnalysis({
      data,
      onSuccess: (response) => {
        if (!pollingModal) setPollingModal(true);
        setProcessStatus(false);
      },
      onError: (error) => {
        setProcessStatus(false);
      },
    });
  };

  const onVideoUploadSuccess = (res, selectAudio, retention, values) => {
    const projectMeta = { duration: values?.duration };

    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        dispatch(
          SET_VIDEO_META({
            uploadedVideoURL: res?.FileName || "",
            uploadedVideoBlobURL: values?.videoBlob || "",
            isVideoUploaded: true,
          })
        );

        dispatch(SET_PROJECT_META({ projectDurationInsec: values?.duration }));
        setProcessStatus(false);
        generateVideoThumbnails(values?.mediaFile, 20).then((thumbnails) => {
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
    }, 10000); // Retry every 5 seconds

    return () => stopPolling(interval); // Cleanup on unmount
  }, [aiMusicGeneratorProgress?.id]);

  return (
    <>
      {processStatus && (
        <CustomLoader
          processPercent={processPercent}
          appendLoaderText={"Uploading video now!"}
        />
      )}
      <Formik
        initialValues={{
          mediaFile: null,
          videoBlob: null,
          duration: null,
        }}
        onSubmit={(values, { setSubmitting }) => {
          console.log("values", values);
          setTimeout(() => {
            handleSubmit(values);
            // uploadFileFunction(values)
          }, 500);
        }}
        validationSchema={validationSchema}
      >
        {(props) => {
          const {
            dirty,
            isValid,
            resetForm,
            isSubmitting,
            errors,
            values,
            handleSubmit,
            setFieldValue,
          } = props;
          return (
            <form onSubmit={handleSubmit}>
              <div className="video_upload_container">
                {values.videoBlob && values.mediaFile && (
                  <video
                    className="video_preview"
                    src={values.videoBlob}
                    onLoadedMetadata={(e) => {
                      console.log("e", e);
                      setFieldValue("duration", e.target.duration);
                    }}
                    controls
                  />
                )}
                <Field
                  id="video_upload_btn_ref"
                  name="mediaFile"
                  label="Upload Video"
                  type="file"
                  className="video_upload_btn"
                  accept="video/mp4,video/quicktime"
                  placeholder={`Upload Video`}
                  component={FileInputWrapper}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setFieldValue("videoBlob", URL.createObjectURL(file));
                  }}
                  onRemove={resetForm}
                />
                {errors.mediaFile && (
                  <SonicInputError>{errors.mediaFile}</SonicInputError>
                )}

                <div className="video_form_btn_container">
                  <ButtonWrapper
                    type="submit"
                    variant="filled"
                    disabled={isSubmitting || !isValid || !dirty}
                  >
                    Generate
                  </ButtonWrapper>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
}
