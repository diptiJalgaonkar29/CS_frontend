import React, { useEffect, useState } from "react";
import { VideoPreview } from "../VideoPreview/VideoPreview";
import "./AITrackCreationWithBrief.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { Field, Formik } from "formik";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useLocation, useNavigate } from "react-router-dom";
import FileInputWrapper from "../../../../branding/componentWrapper/FileInputWrapper";
import TextAreaWrapper from "../../../../branding/componentWrapper/TextAreaWrapper";
import * as Yup from "yup";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import { useDispatch, useSelector } from "react-redux";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import NavStrings from "../../../../routes/constants/NavStrings";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import uploadProjectVideoAndSplitAudio from "../../services/videoDB/uploadProjectVideoAndSplitAudio";
import _ from "lodash";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import removeProjectAIMusic from "../../services/AIMusicDB/removeProjectAIMusic";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import b64toBlob from "../../../../utils/b64toBlob";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";
import fileUpload from "../../services/FileUpload/fileUpload";
import aiAnalysisApiRequest from "../../services/AiAnalysisApiRequest/aiAnalysisApiRequest";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import { FormattedMessage } from "react-intl";
import { addActiveProjectId } from "../../redux/statusSlice";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import { initAIAnalysis } from "../../helperFunctions/initAIAnalysis";

const SUPPORTED_FORMATS = ["application/pdf"];

const validationSchema = Yup.object()
  .shape({
    prompt: Yup.string().trim(),
    mediaFile: Yup.mixed()
      .nullable()
      .test("fileFormat", "Unsupported Format", (value) => {
        if (!value) return true;
        return SUPPORTED_FORMATS.some((format) =>
          value?.type?.startsWith(format)
        );
      }),
  })
  .test("at-least-one", "Either Prompt or Media File is required", (values) => {
    if (!values) return false;
    return !!values.prompt?.trim() || !!values.mediaFile;
  });

const AITrackCreationWithBrief = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let dispatch = useDispatch();
  const { VideoURL = "", fileSource = {}, meta = {} } = location?.state || {};
  const { projectID } = useSelector((state) => state.projectMeta);
  const [projectDuration, setProjectDuration] = useState(0);
  const { cueID, aiMusicGeneratorOption } = useSelector(
    (state) => state.AIMusic
  );
  const { videoNavigationTo, coverImage, uploadedVideoBlobURL } = useSelector(
    (state) => state.video
  );
  const [FileSource, SetFileSource] = useState();
  const [vidSource, setVidSource] = useState();
  const [retain, setRetain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVideoHasAudio, setIsVideoHasAudio] = useState(null);
  const [processPercent, setProcessPercent] = useState(0);
  const [pollingModal, setPollingModal] = useState(false);
  const [fileUploadPopup, setFileUploadPopup] = useState(false);

  const onCancelClick = () => {
    navigate(NavStrings?.WORKSPACE_AI_MUSIC_GENERATOR);
  };

  const handleSubmit = (values) => {
    if (!pollingModal) setPollingModal(true);
    let data = {
      projectID: projectID,
      fileName: values?.prompt ? null : values?.mediaFile?.name,
      mediatype: values?.prompt ? 4 : 3,
      inputText: values?.prompt,
    };

    if (VideoURL && values?.mediaFile) {
      UploadVideoAndSplitAudio({
        split: 0,
        mute: retain ? 0 : 1,
        retention: "Voice",
        selectAudio: "",
        avoidNavigationOnSuccess: true,
      });

      uploadFileFunction(values.mediaFile);
    } else if (VideoURL) {
      UploadVideoAndSplitAudio({
        split: 0,
        mute: retain ? 0 : 1,
        retention: "Voice",
        selectAudio: "",
        avoidNavigationOnSuccess: true,
      });
      aiAnalysisRequest(data);
    } else if (values?.mediaFile) {
      uploadFileFunction(values.mediaFile);
    } else {
      aiAnalysisRequest(data);
    }
  };
  console.log("fileUploadPopup", fileUploadPopup);

  const UploadVideoAndSplitAudio = ({
    split,
    mute,
    selectAudio,
    retention,
    avoidNavigationOnSuccess = false,
  }) => {
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
        // if (!pollingModal) setPollingModal(true)
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
            console.log("first");
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
                console.log("second");
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
          onVideoUploadSuccess(
            videoResponse?.data,
            selectAudio,
            retention,
            avoidNavigationOnSuccess
          );
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
        setPollingModal(false);
      },
    });
  };

  const onVideoUploadSuccess = (
    res,
    selectAudio,
    retention,
    avoidNavigationOnSuccess
  ) => {
    let projectMeta = {
      duration: +projectDuration,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        const url = window.URL.createObjectURL(new Blob([FileSource]));
        console.log("onVideoUploadSuccess");
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

  const uploadFileFunction = (fileObject) => {
    if (!fileObject) {
      console.error("Error: No file selected!");
      return;
    }
    setFileUploadPopup(true);

    var formdata = new FormData();
    formdata.append("file", fileObject);
    formdata.append("projectId", +projectID);

    fileUpload({
      formdata,
      onSuccess: (fileResponse) => {
        let data = {
          projectID: projectID,
          fileName: fileResponse?.data,
          mediatype: 3,
          inputText: fileResponse?.data,
        };

        aiAnalysisRequest(data);
      },
      onError: (error) => {
        console.log("Error Uploading Video", error);
        setLoading(false);
        setFileUploadPopup(false);
        dispatch(RESET_LOADING_STATUS());
        setPollingModal(false);
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

  const aiAnalysisRequest = (data) => {
    initAIAnalysis({
      data,
      onSuccess: (response) => {
        setFileUploadPopup(false);
        if (!pollingModal) setPollingModal(true);
      },
      onError: (error) => {
        setPollingModal(false);
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  return (
    <div className="AITrackCreationWithBrief_container">
      <div>
        <div className="card-icon">
          <IconWrapper icon="MusicFile" />
        </div>
        {(VideoURL || uploadedVideoBlobURL) &&
          aiMusicGeneratorOption === "brief" && (
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
          )}
        <Formik
          initialValues={{
            prompt: "",
            mediaFile: null,
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
              touched,
              values,
              handleSubmit,
              setFieldValue,
            } = props;
            return (
              <form onSubmit={handleSubmit}>
                <SonicInputLabel
                  htmlFor="brief_upload_btn_ref"
                  style={{ marginBottom: "10px" }}
                >
                  Upload Brief
                </SonicInputLabel>
                <Field
                  id="brief_upload_btn_ref"
                  name="mediaFile"
                  label="Upload Brief"
                  type="file"
                  className="brief_upload_btn"
                  accept=".pdf"
                  placeholder={`Upload Brief`}
                  component={FileInputWrapper}
                  disabled={values?.prompt ? true : false}
                  // disabled={true}

                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setFieldValue("mediaFile", file);
                    setFieldValue("prompt", ""); // Clear prompt when mediaFile is selected
                  }}
                />
                {errors.mediaFile && (
                  <SonicInputError>{errors.mediaFile}</SonicInputError>
                )}
                <p className="brief_form_divider">- Or -</p>
                <Field
                  name="prompt"
                  type="text"
                  label="Prompt"
                  placeholder="e.g. A melancholic yet hopeful piano piece with ambient textures, subtle strings, and a soft ticking sound to evoke the passage of time.The composition should feel intimate and cinematic, gradually building in intensity while maintaining a sense of introspection and emotional depth."
                  component={TextAreaWrapper}
                  rows="5"
                  disabled={values?.mediaFile ? true : false}
                  onChange={(e) => {
                    setFieldValue("prompt", e.target.value);
                    setFieldValue("mediaFile", null); // Clear mediaFile when prompt is entered
                  }}
                />

                <div className="brief_form_btn_container">
                  <ButtonWrapper onClick={onCancelClick}>Cancel</ButtonWrapper>
                  <ButtonWrapper
                    type="submit"
                    variant="filled"
                    disabled={isSubmitting || !isValid || !dirty}
                  >
                    Generate
                  </ButtonWrapper>
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
      <ModalWrapper isOpen={pollingModal} className="pollingModal-dialog">
        <p className="pollingModal_header">
          <FormattedMessage id={"workspace.AIMusicGenerator.ProcessingText"} />
        </p>
        <div className="pollingModal_btn">
          {/* <ButtonWrapper variant="outlined" onClick={() => {
            navigate(`${NavStrings?.WORKSPACE_BY_PROJECT_ID_AND_CUE_ID_OPTIONS}/${projectID}`)
          }}>Cancel</ButtonWrapper> */}
          {fileUploadPopup ? (
            <div className="pollingModal_loader">
              <CustomLoaderSpinner />
            </div>
          ) : (
            <ButtonWrapper
              variant="filled"
              disabled={fileUploadPopup}
              onClick={() => navigate(NavStrings?.PROJECTS)}
            >
              Okay
            </ButtonWrapper>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default AITrackCreationWithBrief;
