import { useEffect, useMemo, useRef, useState } from "react";
import "./VideoLayoutV2.css";
import { SET_AI_MUSIC_META } from "../../../modules/workSpace/redux/AIMusicSlice";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../modules/workSpace/pages/AIMusicGeneratorV2/AIMusicGeneratorV2.css";
import showNotification from "../../helperFunctions/showNotification";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../redux/loaderSlice";
import saveCoverImage from "../../../modules/workSpace/services/videoDB/saveCoverImage";
import { useConfig } from "../../../customHooks/useConfig";
import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import { SET_PROJECT_META } from "../../../modules/workSpace/redux/projectMetaSlice";
import { SET_VIDEO_META } from "../../../modules/workSpace/redux/videoSlice";
import removeProjectVideo from "../../../modules/workSpace/services/videoDB/removeProjectVideo";
import getVideoProcessStatus from "../../../modules/workSpace/services/videoDB/getVideoProcessStatus";
import b64toBlob from "../../../utils/b64toBlob";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import ReactPlayer from "react-player";
import UpdateProjectLengthSameAsTTSVoicesModal from "../../../modules/projects/components/UpdateProjectLengthSameAsTTSVoicesModal/UpdateProjectLengthSameAsTTSVoicesModal";
import Timeline from "../../../modules/workSpace/components/Timeline/Timeline";
import WSHeaderActionBtns from "../../../modules/workSpace/components/WSHeaderActionBtns/WSHeaderActionBtns";
import fileUpload from "../../../modules/workSpace/services/FileUpload/fileUpload";
import * as Yup from "yup";
import { initAIAnalysis } from "../../../modules/workSpace/helperFunctions/initAIAnalysis";
import {
  generateAllAITracks,
  getAIAnalysisStatus,
} from "../../../modules/workSpace/helperFunctions/getAIAnalysisStatus";
import getAIAnalysisType from "../../../modules/workSpace/helperFunctions/getAIAnalysisType";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import AIGenSideBarVideoLayoutV2 from "../AIGenSideBarVideoLayoutV2/AIGenSideBarVideoLayoutV2";
import { SET_AI_Track_Stability_META } from "../../../modules/workSpace/redux/AITrackStabilitySlice";
import { SET_AI_MUSIC_Stability_META } from "../../../modules/workSpace/redux/AIMusicStabilitySlice";
import ModalWrapper from "../../../branding/componentWrapper/ModalWrapper";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import IconButtonWrapper from "../../../branding/componentWrapper/IconButtonWrapper";

export const TagWithLabel = ({ label, value }) => {
  return (
    <>
      {value && (
        <div className="tag-group">
          <span className="tag-label boldFamily"> {label} </span>
          <span className="style-selector__button">{value}</span>
        </div>
      )}
    </>
  );
};

function DeleteModal({ open, close, details }) {
  // console.log('details', details)
  let dispatch = useDispatch();
  const { stabilitymp3Url, latestFiledataStability } = useSelector(
    (state) => state.AIMusicStability
  );
  const { stabilityArr } = useSelector((state) => state.AITrackStability);

  const removeVideo = (projectID, id) => {
    removeProjectVideo({ projectID });
    dispatch(SET_VIDEO_META({ uploadedVideoFile: null }));
    close();
  };

  const removeAIAnalysisData = (analysisId) => {
    if (!analysisId) return console.log("analysisId not found : ", analysisId);
    // call api to remove analysis by analysisId and add this in on success
    axiosCSPrivateInstance
      ?.delete(`stability/deleteByProjectId/${details?.type}/${analysisId}`)
      .then(() => {
        const removedStability = stabilityArr?.filter(
          (item) => item.type !== details?.type && !!item?.sentFileName
        );

        dispatch(SET_AI_Track_Stability_META({ stabilityArr: stabilityArr }));
        dispatch(
          SET_AI_MUSIC_Stability_META({
            stabilityLoading: false,
            mp3Urls: stabilitymp3Url,
            latestFiledataStability: removedStability,
          })
        );
        // const AIMusic
        close();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <ModalWrapper
      isOpen={open}
      onClose={close}
      className="ai_Music_genrator_3_dialog"
    >
      <div>
        <>
          <h2>Are you sure you want to delete this video?</h2>
          <span>
            Deleting the video won’t affect your project’s current length. To
            adjust the project duration, click
            <br /> the Edit icon at the top right. The track will automatically
            adapt to the new length.
          </span>
        </>
        <div className="action_btn">
          <ButtonWrapper
            // style={{ width: "250px" }}
            onClick={() => close()}
          >
            Cancel
          </ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            // style={{ width: "250px" }}
            onClick={() => {
              if (details?.deleteKey === "brief") {
                removeAIAnalysisData(details?.analaysisID);
              } else {
                removeVideo(details?.projectID);
                if (details?.projectID) {
                  removeAIAnalysisData(details?.projectID);
                }
              }
            }}
          >
            Delete
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function VideoLayoutV2({ hideHeader = false, children }) {
  const { config, jsonConfig } = useConfig();
  let { brandMeta } = getCSUserMeta();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRef = useRef();
  const param = useParams();

  const [shareData, setShareData] = useState({});
  const [open, setOpen] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [isErroredVideo, setisErroredVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const { latestFiledataStability, stabilityMP3TracksArr } = useSelector(
    (state) => state.AIMusicStability
  );
  const { stabilityArr, currentUseThisTrack } = useSelector(
    (state) => state.AITrackStability
  );

  const { uploadedVideoURL, uploadedVideoBlobURL, coverImage, tXId } =
    useSelector((state) => state.video);
  const {
    projectID,
    isVideoPlaying,
    timelineSeekTime,
    isVideoLoading,
    isVideoProcessing,
    activeWSTab,
  } = useSelector((state) => state.projectMeta);
  const { TTSTimelineVoicesMP3 } = useSelector((state) => state.voices);
  const {
    selectedAIMusicDetails,
    aiMusicGeneratorProgress,
    aiMusicGeneratorAnalysisDetails,
    recentAIGeneratedData,
    freshAITracksVariantsList,
    SSflaxTrackID,
  } = useSelector((state) => state.AIMusic);

  const fetchVideoFromServer = (controller) => {
    dispatch(
      SET_PROJECT_META({
        isVideoLoading: true,
      })
    );
    axiosCSPrivateInstance(`/video/${uploadedVideoURL}`, {
      responseType: "blob",
      signal: controller.signal,
      onDownloadProgress: (progressEvent) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProcessPercent(percentage);
      },
    })
      .then((response) => {
        if (
          !response?.data?.type?.includes("video/") ||
          response?.data?.size === 0
        )
          return;
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setisErroredVideo(false);
        dispatch(SET_VIDEO_META({ uploadedVideoBlobURL: url }));
        let thumbnailsArr = [];
        generateVideoThumbnails(response.data, 20)
          .then((thumbnails) => {
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
          })
          .catch((err) => {
            console.log("Error :", err);
            dispatch(
              SET_PROJECT_META({
                isVideoLoading: false,
              })
            );
          });
      })
      .catch((err) => {
        console.log("err", err);
        dispatch(
          SET_PROJECT_META({
            isVideoLoading: false,
          })
        );
      });
  };

  // console.log('aiMusicGeneratorAnalysisDetails', aiMusicGeneratorAnalysisDetails)

  const removeVideo = (projectID) => {
    removeProjectVideo({ projectID });
    dispatch(SET_VIDEO_META({ uploadedVideoFile: null }));
  };

  const onVideoError = () => {
    dispatch(
      SET_VIDEO_META({ uploadedVideoBlobURL: "", uploadedVideoFile: null })
    );
    setisErroredVideo(true);
  };

  const onVideoReady = (e) => {
    if (e.getSecondsLoaded()) {
      dispatch(
        SET_PROJECT_META({
          isVideoLoading: false,
        })
      );
    }
  };

  useEffect(() => {
    if (
      !videoRef.current ||
      [null, undefined].includes(timelineSeekTime) ||
      isNaN(timelineSeekTime)
    )
      return;
    videoRef.current?.seekTo(timelineSeekTime, "seconds");
  }, [timelineSeekTime]);

  useEffect(() => {
    const controller = new AbortController();
    let fetchVideoCount = 0;
    const MAX_FETCH_VIDEO_LIMIT = 3;
    if (!isErroredVideo) return;
    let id = setTimeout(() => {
      if (fetchVideoCount < MAX_FETCH_VIDEO_LIMIT) {
        fetchVideoFromServer(controller);
        fetchVideoCount++;
      } else {
        console.log("MAX_FETCH_VIDEO_LIMIT reached !!!!");
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(id);
      fetchVideoCount = 0;
    };
  }, [isErroredVideo]);

  useEffect(() => {
    if (!uploadedVideoURL || isVideoProcessing) return;
    const controller = new AbortController();
    if (!uploadedVideoBlobURL) {
      fetchVideoFromServer(controller);
    } else {
      setProcessPercent(100);
    }
    return () => controller.abort();
  }, [uploadedVideoURL, isVideoProcessing]);

  useEffect(() => {
    if (!isVideoProcessing) return;
    let intevalId;
    intevalId = setInterval(() => {
      getVideoProcessStatus({ projectID }).then((res) => {
        if (res?.status === "completed") {
          dispatch(
            SET_PROJECT_META({
              isVideoProcessing: false,
            })
          );
          showNotification("SUCCESS", `Your video has been processed`, 4000);
          clearInterval(intevalId);
        }
      });
    }, jsonConfig?.FETCH_AUDIO_FROM_VIDEO_INTERVAL || 10000);

    return () => {
      clearInterval(intevalId);
    };
  }, [isVideoProcessing]);

  const stopPolling = (interval) => {
    clearInterval(interval);
    // dispatch(RESET_LOADING_STATUS());
  };

  // useEffect(() => {
  //   if (!aiMusicGeneratorProgress?.id) return;
  //   getAIAnalysisStatus({
  //     analysisId: aiMusicGeneratorProgress?.id,
  //     navigate,
  //     stopPollingRequest: () => {
  //       stopPolling(interval);
  //     },
  //     config,
  //     jsonConfig,
  //   });
  //   const interval = setInterval(() => {
  //     getAIAnalysisStatus({
  //       analysisId: aiMusicGeneratorProgress?.id,
  //       navigate,
  //       stopPollingRequest: () => {
  //         stopPolling(interval);
  //       },
  //       config,
  //       jsonConfig,
  //     });
  //   }, 10000); // Retry every 5 seconds

  //   return () => stopPolling(interval); // Cleanup on unmount
  // }, [aiMusicGeneratorProgress?.id]);

  const removeAIAnalysisData = (analysisId) => {
    if (!analysisId) return console.log("analysisId not found : ", analysisId);
    // call api to remove analysis by analysisId and add this in on success
    axiosCSPrivateInstance
      ?.delete(`ai_analysis/deleteByAiID/${analysisId}`)
      .then(() => {
        const newAiMusicGeneratorAnalysisDetails =
          aiMusicGeneratorAnalysisDetails.filter(
            (item) => item.id !== analysisId
          );
        // const AIMusic
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorAnalysisDetails: newAiMusicGeneratorAnalysisDetails,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (!aiMusicGeneratorAnalysisDetails?.length) return;

    const isAITrackGenerated = aiMusicGeneratorAnalysisDetails.find(
      (item) => !item?.isTuneyTrackGenerated
    );

    if (isAITrackGenerated) {
      generateAllAITracks({
        combinationStr: isAITrackGenerated?.aiGenData,
        dispatch,
        navigate,
        analysisId: isAITrackGenerated?.id,
        recentAIGeneratedData,
        freshAITracksVariantsList,
        SSflaxTrackID,
        projectID,
        config,
        jsonConfig,
        brandMeta,
        aiMusicGeneratorAnalysisDetails,
      });
      return;
    }
  }, []);

  useEffect(() => {
    console.log("latestFiledataStability-789523", latestFiledataStability);
    let project_id = latestFiledataStability?.find((r) => r.projectId);
    if (latestFiledataStability?.length === 0 || !latestFiledataStability)
      return;
    if (latestFiledataStability.some((r) => r.status === "not_send")) {
      dispatch(
        SET_AI_MUSIC_Stability_META({
          latestFiledataStability: [],
          stabilityMP3TracksArr: stabilityMP3TracksArr,
          stabilityLoading: false,
        })
      );
      return;
    }
    if (
      latestFiledataStability.some(
        (r) => r.status !== "completed" && !r.fileName
      )
    ) {
      console.log("latestFiledataStability-7852", latestFiledataStability);
      let getType = latestFiledataStability?.find((r) => r.type);
      console.log("getType", getType);
      const poll = async () => {
        try {
          const { data: rows } = await axiosCSPrivateInstance.get(
            `/stability/getByType/${getType?.type}/${project_id?.projectId}`
          );

          console.log("rows", rows);

          // ✅ Check for completion
          if (
            rows.length &&
            rows.every((r) => r.status === "completed" && r.fileName !== null)
          ) {
            const fileNames = rows.map((r) => r.fileName);
            console.log("fileNames", fileNames);

            try {
              const fileRequests = fileNames.map((file) =>
                axiosCSPrivateInstance.get(
                  `/stability/GetMediaFile/${project_id?.projectId}/${file}`,
                  { responseType: "blob" }
                )
              );

              const results = await Promise.all(fileRequests);

              const objectURLArr = results.map((res) =>
                URL.createObjectURL(res.data)
              );
              console.log("Fetched all Stability MP3 files:", objectURLArr);

              dispatch(
                SET_AI_Track_Stability_META({
                  stabilityArr: [...stabilityArr, ...objectURLArr],
                  currentUseThisTrack: currentUseThisTrack,
                })
              );
              dispatch(
                SET_AI_MUSIC_Stability_META({
                  latestFiledataStability: rows,
                  stabilityMP3TracksArr: [
                    ...stabilityMP3TracksArr,
                    ...fileNames,
                  ],
                  stabilityLoading: false,
                })
              );
            } catch (err) {
              console.error("Failed to generate blob URLs:", err);
            }

            // ✅ Stop polling once everything is ready
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Polling error:", err);
          showNotification("ERROR", "Error while polling Stability data");
        }
      };

      // Start polling every 10 seconds
      poll(); // run immediately once
      const intervalId = setInterval(poll, 10000);

      // Clean up if the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [projectID, latestFiledataStability]);

  useEffect(() => {
    console.log("21546879");
    if (stabilityArr?.length > 0 || !param?.project_id) return;
    console.log("called", "called");

    const generateBlob = async () => {
      try {
        const fileRequests = stabilityMP3TracksArr
          .flat()
          .map((file) =>
            axiosCSPrivateInstance.get(
              `/stability/GetMediaFile/${projectID}/${file}`,
              { responseType: "blob" }
            )
          );

        const results = await Promise.all(fileRequests);

        // Create object URLs for each blob
        const objectURLArr = results.map((res) =>
          URL.createObjectURL(res.data)
        );
        console.log("Fetched all Stability MP3 files:", objectURLArr);

        // Dispatch here, where objectURLArr exists
        dispatch(
          SET_AI_Track_Stability_META({
            stabilityArr: objectURLArr,
            currentUseThisTrack: currentUseThisTrack,
          })
        );
      } catch (err) {
        console.error("Failed to generate blob URLs:", err);
      }
    };

    generateBlob();
  }, [projectID]);

  return (
    <>
      {!hideHeader && <WSHeaderActionBtns />}
      {activeWSTab === "Voice" ? (
        <div
          className="video_layout_v2_container"
          id="video_layout_v2_container"
        >
          {uploadedVideoURL && (
            <div className={`video_container`} style={{ width: "35%" }}>
              <button
                className="delete_icon_btn"
                disabled={
                  isVideoLoading ||
                  isVideoProcessing ||
                  loading ||
                  (!!aiMusicGeneratorProgress?.id &&
                    !["failed", "completed"].includes(
                      aiMusicGeneratorProgress?.status
                    ))
                }
              >
                <div className="delete_icon_container">
                  <IconButtonWrapper
                    icon="Trash"
                    onClick={() => {
                      removeVideo(projectID);
                      const videoAnalysisId =
                        aiMusicGeneratorAnalysisDetails?.find(
                          (item) =>
                            getAIAnalysisType(+item?.mediatype) === "video"
                        )?.id;
                      removeAIAnalysisData(videoAnalysisId);
                    }}
                  />
                </div>
              </button>
              {isVideoLoading && (
                <div className="video_container_loader">
                  <CustomLoaderSpinner processPercent={processPercent} />
                </div>
              )}
              {isVideoProcessing && (
                <div className="video_container_processing">
                  <CustomLoaderSpinner />
                  <p> Your video is processing </p>
                </div>
              )}
              <ReactPlayer
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
                ref={videoRef}
                width="100%"
                height="100%"
                controls
                muted={true}
                url={uploadedVideoBlobURL}
                playing={isVideoPlaying}
                onError={onVideoError}
                onReady={onVideoReady}
                className="project_video"
                id="project_video"
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
            </div>
          )}
          <div
            className="content_container"
            style={{ width: uploadedVideoURL ? "65%" : "100%" }}
          >
            {children}
            <div
              className="video_layout_container_filler"
              id="video_layout_container_filler"
            />
          </div>
        </div>
      ) : activeWSTab === "AI Music" ? (
        <div
          className="video_layout_v2_container"
          id="video_layout_v2_container"
          style={{
            gap:
              uploadedVideoURL || uploadedVideoBlobURL || !param?.cue_id
                ? "25px"
                : "0%",
          }}
        >
          <div
            style={{
              width:
                uploadedVideoURL || uploadedVideoBlobURL || !param?.cue_id
                  ? "35%"
                  : "0%",
            }}
          >
            {!param?.cue_id ? (
              <div className="video_layout_v2_card_container">
                <div className="content">
                  <AIGenSideBarVideoLayoutV2>
                    {uploadedVideoBlobURL && (
                      <div className={`video_container`}>
                        <>
                          {/* <button
                            className="delete_icon_btn"
                            disabled={
                              isVideoLoading ||
                              isVideoProcessing ||
                              loading ||
                              (!!aiMusicGeneratorProgress?.id &&
                                !["failed", "completed"].includes(
                                  aiMusicGeneratorProgress?.status
                                ))
                            }
                          >
                            <div className="delete_icon_container">
                              <IconWrapper
                                icon="Trash"
                                onClick={() => {
                                  removeVideo(projectID);
                                  const videoAnalysisId =
                                    aiMusicGeneratorAnalysisDetails?.find(
                                      (item) =>
                                        getAIAnalysisType(+item?.mediatype) ===
                                        "video"
                                    )?.id;
                                  removeAIAnalysisData(videoAnalysisId);
                                }}
                              />
                            </div>
                          </button> */}
                          {isVideoLoading && (
                            <div
                              className="video_container_loader"
                              style={{ height: "350px", width: "35%" }}
                            >
                              <CustomLoaderSpinner
                                processPercent={processPercent}
                              />
                            </div>
                          )}
                          {isVideoProcessing && (
                            <div
                              className="video_container_processing"
                              style={{ height: "350px", width: "35%" }}
                            >
                              <CustomLoaderSpinner />
                              <p> Your video is processing </p>
                            </div>
                          )}
                          <ReactPlayer
                            style={{
                              backgroundColor: "var(--color-secondary)",
                              borderRadius: "10px",
                              overflow: "hidden",
                            }}
                            ref={videoRef}
                            width="100%"
                            height={param?.cue_id ? "350px" : "250px"}
                            controls
                            muted={true}
                            url={uploadedVideoBlobURL}
                            playing={isVideoPlaying}
                            onError={onVideoError}
                            onReady={onVideoReady}
                            className="project_video"
                            id="project_video_v2"
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
                        </>
                      </div>
                    )}
                  </AIGenSideBarVideoLayoutV2>
                </div>
              </div>
            ) : (
              <>
                {uploadedVideoBlobURL && (
                  <div className={`video_container`}>
                    <>
                      <button
                        className="delete_icon_btn"
                        disabled={
                          isVideoLoading ||
                          isVideoProcessing ||
                          loading ||
                          (!!aiMusicGeneratorProgress?.id &&
                            !["failed", "completed"].includes(
                              aiMusicGeneratorProgress?.status
                            ))
                        }
                      >
                        <div className="delete_icon_container">
                          <IconButtonWrapper
                            icon="Trash"
                            onClick={() => {
                              removeVideo(projectID);

                              const videoAnalysisId =
                                aiMusicGeneratorAnalysisDetails?.find(
                                  (item) =>
                                    getAIAnalysisType(+item?.mediatype) ===
                                    "video"
                                )?.id;

                              if (videoAnalysisId) {
                                removeAIAnalysisData(videoAnalysisId);
                              }
                            }}
                          />
                        </div>
                      </button>
                      {isVideoLoading && (
                        <div
                          className="video_container_loader"
                          style={{ height: "350px", width: "35%" }}
                        >
                          <CustomLoaderSpinner
                            processPercent={processPercent}
                          />
                        </div>
                      )}
                      {isVideoProcessing && (
                        <div
                          className="video_container_processing"
                          style={{ height: "350px", width: "35%" }}
                        >
                          <CustomLoaderSpinner />
                          <p> Your video is processing </p>
                        </div>
                      )}
                      <ReactPlayer
                        style={{
                          backgroundColor: "var(--color-secondary)",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                        ref={videoRef}
                        width="100%"
                        height={param?.cue_id ? "350px" : "250px"}
                        controls
                        muted={true}
                        url={uploadedVideoBlobURL}
                        playing={isVideoPlaying}
                        onError={onVideoError}
                        onReady={onVideoReady}
                        className="project_video"
                        id="project_video_v2"
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
                    </>
                  </div>
                )}
              </>
            )}

            {/* <DeleteModal open={open} close={() => setOpen(false)} /> */}
          </div>
          <div
            className="content_container"
            style={{
              width:
                uploadedVideoURL || uploadedVideoBlobURL || !param?.cue_id
                  ? "65%"
                  : "100%",
              overflow: "auto",
            }}
          >
            {children}
            <div
              className="video_layout_container_filler"
              id="video_layout_container_filler"
            />
          </div>
        </div>
      ) : (
        <div className="video_layout_v2_loader">
          <CustomLoaderSpinner />
        </div>
      )}
      {TTSTimelineVoicesMP3?.length !== 0 ||
      selectedAIMusicDetails?.cue_id ||
      (brandMeta?.aiMusicProvider == "stability" && !!param?.cue_id) ||
      !!tXId ? (
        <>
          <UpdateProjectLengthSameAsTTSVoicesModal />
          <Timeline />
        </>
      ) : null}
    </>
  );
}
