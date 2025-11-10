import React, { useEffect, useState } from "react";
import "../../pages/uploadVideoPage/UploadVideoPage.css";
import Layout from "../../../../common/components/layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import {
  // RESET_TTS_TIMELINE_VOICES,
  RESET_VOICE_META,
} from "../../redux/voicesSlice";
import { useConfig } from "../../../../customHooks/useConfig";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import b64toBlob from "../../../../utils/b64toBlob";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import "./AudioRetentionPage.css";
import formatTime from "../../../../utils/formatTime";
import uploadProjectVideoAndSplitAudio from "../../services/videoDB/uploadProjectVideoAndSplitAudio";
import showNotification from "../../../../common/helperFunctions/showNotification";
import removeProjectAIMusic from "../../services/AIMusicDB/removeProjectAIMusic";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import NavStrings from "../../../../routes/constants/NavStrings";
import AudioSplitterConfirmationModal from "../../components/AudioSplitterConfirmationModal/AudioSplitterConfirmationModal";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import AudioRetentionTandC from "../../components/AudioRetentionTandC/AudioRetentionTandC";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import RadioWrapper from "../../../../branding/componentWrapper/RadioWrapper";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import _ from "lodash";
import {
  checkAIMusicCreateAccess,
  checkAIMusicEditAccess,
  checkAIMusicVariantAccess,
} from "../../../../utils/checkAppAccess";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { brandConstants } from "../../../../utils/brandConstants";
import getBrandName from "../../../../utils/getBrandName";

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

const AudioRetentionPage = () => {
  const location = useLocation();
  const { VideoURL = "", fileSource = {}, meta = {} } = location?.state || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useConfig();
  const { videoNavigationTo, coverImage } = useSelector((state) => state.video);
  const { appAccess } = useSelector((state) => state.auth);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [vidSource, setVidSource] = useState();
  const [showPermission, setPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [projectDuration, setProjectDuration] = useState(0);
  const [FileSource, SetFileSource] = useState();
  const [isVideoHasAudio, setIsVideoHasAudio] = useState(null);
  const { aiMusicGenerator, cueID } = useSelector((state) => state.AIMusic);

  useEffect(() => {
    SetFileSource(fileSource);
    setVidSource(VideoURL);
  }, [VideoURL, fileSource]);

  const getActiveWSTab = (appAccess, condition) => {
    if (appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
      return condition ? "Voice" : "AI Music";
    } else if (!appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
      return "Voice";
    } else if (appAccess?.AI_MUSIC && !appAccess?.AI_VOICE) {
      return "AI Music";
    } else {
      return "Voice";
    }
  };

  // split
  // 0=vocals
  // 1=instrumental

  // mute
  // 0=retain audio
  // 1=video mute

  const UploadVideoAndSplitAudio = ({
    split,
    mute,
    selectAudio,
    retention,
    setSubmitting,
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
          // console.log(
          //   "audio retention activeWSTab : ",
          //   split,
          //   getActiveWSTab(appAccess, split.toString() === "1")
          // );
          // console.log("retention : ", retention);
          // console.log("arguments : ", {
          //   split,
          //   mute,
          //   selectAudio,
          //   retention,
          //   setSubmitting,
          // });

          // dispatch(
          //   SET_PROJECT_META({
          //     activeWSTab: getActiveWSTab(appAccess, split.toString() === "1"),
          //   })
          // );

          if (retention === "Voice") {
            const voiceMeta = {
              projectId: projectID,
              jsonStructure: [],
              ttsTimelineStructure: [],
            };
            updateVoiceMeta({
              voiceMeta,
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
            let saveTheLastFlow = aiMusicGenerator?.projectFlow;
            removeProjectAIMusic({
              projectID,
              onSuccess: () => {
                dispatch(RESET_AI_MUSIC_META());
                // console.log(
                //   "videoNavigationTo",
                //   getWorkSpacePath(projectID, null)
                // );
                // dispatch(
                //   SET_AI_MUSIC_META({
                //     aiMusicGenerator: {
                //       id: null,
                //       status: null,
                //       projectFlow: saveTheLastFlow,
                //     },
                //   })
                // );
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
        setSubmitting(false);
      },
    });
  };

  const onVideoUploadSuccess = (res, selectAudio, retention) => {
    let projectMeta = {
      duration: +projectDuration,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        const url = window.URL.createObjectURL(new Blob([FileSource]));
        dispatch(
          SET_VIDEO_META({
            uploadedVideoURL: res?.FileName || "",
            uploadedVideoBlobURL: url || "",
            isVideoUploaded: true,
            uploadedVideoFile: fileSource
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
          if (selectAudio === "AudioOn") {
            // console.log(
            //   "retention, projectID, cueID****123",
            //   retention,
            //   projectID,
            //   cueID
            // );
            if (retention === "Music") {
              navigate(getWorkSpacePath(projectID, null));
            } else if (retention === "Voice") {
              navigate(videoNavigationTo);
            } else {
              navigate(getWorkSpacePath(projectID, cueID));
            }
          } else {
            // console.log("videoNavigationTo****", videoNavigationTo);
            navigate(videoNavigationTo);
          }
        }, 250);
      },
    });
  };

  const permissionHandler = (values, setSubmitting) => {
    if (values?.selectAudio === "AudioOff") {
      UploadVideoAndSplitAudio({ split: 0, mute: 1, ...values, setSubmitting });
      return;
    }
    if (
      values?.selectAudio === "AudioOn" &&
      !(appAccess?.AI_VOICE && appAccess?.AI_MUSIC)
    ) {
      UploadVideoAndSplitAudio({
        split: values.retention === "Voice" ? 0 : 1,
        mute: 0,
        ...values,
        setSubmitting,
      });
      return;
    }
    if (!showPermission) {
      setPermission(!showPermission);
    }
  };

  const hasAudio = (video) => {
    if (!video) return null;
    return (
      video?.mozHasAudio ||
      Boolean(video?.webkitAudioDecodedByteCount) ||
      Boolean(video?.audioTracks && video?.audioTracks?.length)
    );
  };

  return (
    <Layout fullWidth={true}>
      <div className="audioRetentionPage_container">
        {loading && (
          <CustomLoader
            processPercent={processPercent}
            appendLoaderText={"Uploading video now!"}
          />
        )}
        <Formik
          initialValues={{
            selectAudio: "",
            retention: "",
            acceptTerms: "",
          }}
          onSubmit={(values, { setSubmitting, setFieldValue }) => {
            setTimeout(() => {
              let retention = values.retention;
              if (!retention && values.selectAudio === "AudioOn") {
                if (appAccess?.AI_VOICE && !appAccess?.AI_MUSIC) {
                  retention = "Music";
                } else if (!appAccess?.AI_VOICE && appAccess?.AI_MUSIC) {
                  retention = "Voice";
                } else {
                  retention = !checkAIMusicCreateAccess() ? "Music" : "Voice";
                }
              }
              setFieldValue("retention", retention);
              let newValues = { ...values, retention };
              // console.log("values", JSON.stringify(values, null, 2));
              // console.log("newValues", JSON.stringify(newValues, null, 2));
              permissionHandler(newValues, setSubmitting);
            }, 500);
          }}
          validationSchema={Yup.object().shape({
            selectAudio: Yup.string().required("Required"),
            retention: Yup.string().when("selectAudio", {
              // is: "AudioOn",
              is: (value) => {
                if (!checkAIMusicCreateAccess()) {
                  return (
                    value === "AudioOn" &&
                    appAccess?.AI_VOICE &&
                    appAccess?.AI_MUSIC &&
                    checkAIMusicCreateAccess()
                  );
                } else {
                  return (
                    value === "AudioOn" &&
                    appAccess?.AI_VOICE &&
                    appAccess?.AI_MUSIC
                  );
                }
              },
              then: Yup.string().required("Required"),
            }),
            acceptTerms: Yup.string().required("Required"),
            // acceptTerms: Yup.string().when("selectAudio", {
            // is: "AudioOn",
            // is: (value) => value === "AudioOn",
            // then: Yup.string().required("Required"),
            // }),
          })}
        >
          {(props) => {
            const {
              values,
              dirty,
              isValid,
              isSubmitting,
              touched,
              errors,
              handleSubmit,
              setSubmitting,
            } = props;
            return (
              <form onSubmit={handleSubmit}>
                <div className="audio_on_off_container">
                  <div className="audio_on_off_header">
                    <p className="title boldFamily">Upload Video</p>
                    <p className="sub_title">
                      If your video has audio already, would you like to retain
                      this audio for your project?
                    </p>
                  </div>
                  <div className="audioRetentionPage_field_container">
                    <SonicInputLabel>Retain Video's Audio?</SonicInputLabel>
                    <div className="audioRetentionPage_radio_field_container">
                      <Field
                        name="selectAudio"
                        value="AudioOff"
                        component={RadioWrapper}
                        label="Audio Off"
                        id="audio_retention_audioOff"
                        type="radio"
                      />
                      <Field
                        type="radio"
                        name="selectAudio"
                        value="AudioOn"
                        component={RadioWrapper}
                        label="Audio On"
                        id="audio_retention_audioOn"
                        disabled={!isVideoHasAudio}
                      />
                    </div>
                    {errors.selectAudio && touched.selectAudio && (
                      <SonicInputError>{errors.selectAudio}</SonicInputError>
                    )}
                  </div>
                  {!checkAIMusicCreateAccess()
                    ? values.selectAudio === "AudioOn" &&
                      appAccess?.AI_VOICE &&
                      appAccess?.AI_MUSIC &&
                      checkAIMusicCreateAccess()
                    : values.selectAudio === "AudioOn" &&
                      appAccess?.AI_VOICE &&
                      appAccess?.AI_MUSIC && (
                        <div className="AudioRetentionPage_field_container">
                          <SonicInputLabel>
                            What would you like to retain?
                          </SonicInputLabel>
                          <div className="audioRetentionPage_radio_field_container">
                            <div>
                              <Field
                                name="retention"
                                value="Voice"
                                component={RadioWrapper}
                                label="Voice"
                                id="audio_retention_voice"
                                type="radio"
                              />
                              <p className="retention_radio_desc">
                                Only music can be added to this selection
                              </p>
                            </div>
                            <div>
                              <Field
                                type="radio"
                                name="retention"
                                value="Music"
                                component={RadioWrapper}
                                label="Music"
                                id="audio_retention_music"
                              />
                              <p className="retention_radio_desc">
                                Only voice can be added to this selection
                              </p>
                            </div>
                          </div>
                          {errors.retention && touched.retention && (
                            <SonicInputError>
                              {errors.retention}
                            </SonicInputError>
                          )}
                        </div>
                      )}
                  <Field
                    name="acceptTerms"
                    value="true"
                    component={RadioWrapper}
                    label={<AudioRetentionTandC />}
                    allowHtmlLabel={true}
                    id="audio_retention_acceptTerms"
                    type="radio"
                  />
                  <div className="btn_container">
                    <ButtonWrapper
                      variant="outlined"
                      onClick={() => {
                        // navigate(-1);
                        navigate(NavStrings.UPLOAD_VIDEO);
                      }}
                    >
                      Back
                    </ButtonWrapper>
                    <ButtonWrapper
                      variant="filled"
                      type="submit"
                      disabled={isSubmitting || !isValid || !dirty}
                    >
                      Next
                    </ButtonWrapper>
                  </div>

                  <div className="playerContainer">
                    <ReactPlayer
                      className="test"
                      id="test"
                      width="199px"
                      height="118px"
                      url={vidSource}
                      muted={values.selectAudio === "AudioOff"}
                      onDuration={(duration) => {
                        if (!isNaN(duration)) {
                          setProjectDuration(duration);
                        }
                      }}
                      onReady={(e) => {
                        const video = document.querySelector(
                          ".playerContainer video"
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
                    <p className="VideoTime">
                      {projectDuration && formatTime(projectDuration)}
                    </p>
                  </div>
                </div>
                <AudioSplitterConfirmationModal
                  isOpen={showPermission}
                  onClose={() => {
                    setPermission(false);
                    setSubmitting(false);
                  }}
                  retention={values.retention}
                  selectAudio={values.selectAudio}
                  setSubmitting={setSubmitting}
                  UploadVideoAndSplitAudio={UploadVideoAndSplitAudio}
                />
              </form>
            );
          }}
        </Formik>
      </div>
    </Layout>
  );
};

export default AudioRetentionPage;
