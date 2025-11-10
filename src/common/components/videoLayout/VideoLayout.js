import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import "./VideoLayout.css";
import { useConfig } from "../../../customHooks/useConfig";
import { SET_VIDEO_META } from "../../../modules/workSpace/redux/videoSlice";
import { SET_PROJECT_META } from "../../../modules/workSpace/redux/projectMetaSlice";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import Timeline from "../../../modules/workSpace/components/Timeline/Timeline";
import WSHeaderActionBtns from "../../../modules/workSpace/components/WSHeaderActionBtns/WSHeaderActionBtns";
import b64toBlob from "../../../utils/b64toBlob";
import removeProjectVideo from "../../../modules/workSpace/services/videoDB/removeProjectVideo";
import saveCoverImage from "../../../modules/workSpace/services/videoDB/saveCoverImage";
import getVideoProcessStatus from "../../../modules/workSpace/services/videoDB/getVideoProcessStatus";
import showNotification from "../../helperFunctions/showNotification";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import UpdateProjectLengthSameAsTTSVoicesModal from "../../../modules/projects/components/UpdateProjectLengthSameAsTTSVoicesModal/UpdateProjectLengthSameAsTTSVoicesModal";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import { useNavigate, useParams } from "react-router-dom";
import getWorkSpacePath from "../../../utils/getWorkSpacePath";
import NavStrings from "../../../routes/constants/NavStrings";
import { SideBarMusicStyleSelector } from "../../../modules/workSpace/components/SideBarMusicStyleSelector/SideBarMusicStyleSelector";
import { SET_AI_MUSIC_META } from "../../../modules/workSpace/redux/AIMusicSlice";
import generateTrack from "../../../modules/workSpace/services/TuneyAIMusic/generateTrack";
import generateCue from "../../../modules/workSpace/services/TuneyAIMusic/generateCue";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import randomIntFromInterval from "../../../utils/randomIntFromInterval";
import aiAnalysisApiRequest from "../../../modules/workSpace/services/AiAnalysisApiRequest/aiAnalysisApiRequest";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../redux/loaderSlice";
import { ReactComponent as UploadArrow } from "../../../static/common/Upload_Arrow.svg";
import { ReactComponent as ManualSettingArrow } from "../../../static/common/manual_setting_arrow.svg";
import getSuperBrandName from "../../../utils/getSuperBrandName";
import { brandConstants } from "../../../utils/brandConstants";
import TextAreaWrapper from "../../../branding/componentWrapper/TextAreaWrapper";

const VideoLayout = ({ children }) => {
  let { jsonConfig } = useConfig();
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRef = useRef();
  const param = useParams();
  const superBrandName = getSuperBrandName();
  const [processPercent, setProcessPercent] = useState(0);
  const [isErroredVideo, setisErroredVideo] = useState(false);
  const [selectedTempo, setSelectedTempo] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const { brandMeta } = getCSUserMeta();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [variantList, setvariantList] = useState([]);
  const [previousTracks, setPreviousTracks] = useState([]);
  const [tempoOptions, setTempoOptions] = useState([
    { label: "fast" },
    { label: "slow" },
    { label: "random" },
  ]);
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
  const [videoLoader, setVideoLoader] = useState(false);
  const [storeAllTrackDataFromSS, setStoreAllTrackDataFromSS] = useState([]);
  const {
    selectedAIMusicDetails,
    cueID,
    aiMusicGeneratorOption,
    aiMusicGenerator,
    selectedAIMusicConfig,
    aiMusicGeneratorTrackDetails,
  } = useSelector((state) => state.AIMusic);
  const [open, setOpen] = useState(
    ["tags"].includes(aiMusicGenerator?.projectFlow || aiMusicGeneratorOption)
      ? true
      : false
  );
  const [pollingID, setPollingID] = useState(
    ["tags"].includes(aiMusicGenerator?.projectFlow || aiMusicGeneratorOption)
      ? null
      : param?.cue_id
      ? null
      : !aiMusicGenerator?.status
      ? null
      : projectID
  );
  let storeOldFlow = aiMusicGenerator?.projectFlow || aiMusicGeneratorOption;

  const fetchVideoFromServer = (controller) => {
    dispatch(
      SET_PROJECT_META({
        isVideoLoading: true,
      })
    );
    if (!videoLoader) setVideoLoader(true);
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
            setVideoLoader(false);
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
            setVideoLoader(false);
            dispatch(
              SET_PROJECT_META({
                isVideoLoading: false,
              })
            );
          });
      })
      .catch((err) => {
        console.log("err", err);
        setVideoLoader(false);
        dispatch(
          SET_PROJECT_META({
            isVideoLoading: false,
          })
        );
      });
  };

  const getTempoValue = (selectedTempo) => {
    if (selectedTempo !== "random") {
      return selectedTempo;
    }
    let randomIndex = randomIntFromInterval(0, tempoOptions?.length - 2);
    let randomTempo = tempoOptions[randomIndex];
    return randomTempo?.label || "slow";
  };

  const removeVideo = (projectID) => {
    removeProjectVideo({ projectID });
    // if (
    //   ["brief", "video"].includes(aiMusicGenerator?.projectFlow || aiMusicGeneratorOption)
    // ) {
    //   dispatch(
    //     SET_AI_MUSIC_META({
    //       allTrackFromSSFromServer: [],
    //       aiMusicGeneratorTrackDetails: [],
    //     }))
    // } else if (
    //   recentAIGeneratedData?.length !== 0 || freshAITracksVariantsList !== 0
    // ) {
    //   dispatch(
    //     SET_AI_MUSIC_META({
    //     }))
    // }
    dispatch(
      SET_AI_MUSIC_META({
        allTrackFromSSFromServer: [],
        aiMusicGeneratorTrackDetails: [],
        recentAIGeneratedData: [],
        freshAITracksVariantsList: [],
      })
    );
  };

  const onVideoError = () => {
    console.log("Error while loading video ", uploadedVideoBlobURL);
    dispatch(SET_VIDEO_META({ uploadedVideoBlobURL: "" }));
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

  const GetTaskID = (selectedGenre, selectedMood, selectedTempo) => {
    setLoadingConfig(true);

    let body = {
      length: +jsonConfig?.CACHED_AI_MUSIC_LENGTH,
      brand_tag_code: brandMeta?.tuneyBrandName,
      build: "none",
      genre: selectedGenre,
      mood: selectedMood,
      tempo: selectedTempo,
      flax_track_id: null,
    };

    generateTrack({
      config: body,
      onSuccess: (response) => {
        generateCueID(response.data.task_id);
      },
      onError: () => {
        setLoadingConfig(false);
      },
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => {},
      onSuccess: (response) => {
        setvariantList((prev) => [response.data, ...prev]);
      },
      onError: () => {
        setLoadingConfig(false);
      },
    });
  };

  const handleBriefSubmit = (event) => {
    // event.preventDefault();
    dispatch(
      SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
    );
    let data = {
      projectID: projectID,
      inputText: brief,
      fileName: null,
      mediatype: 4,
    };
    aiAnalysisApiRequest({
      data,
      onSuccess: (Response) => {
        if (Response?.status === 200) {
          setPollingID(Response?.data?.projectID || projectID);
        }
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGenerator: {
              id: Response?.data?.id,
              status: Response?.data?.status,
              mediatype: Response?.data?.mediatype,
              projectFlow: storeOldFlow,
            },
          })
        );
      },
      onError: (error) => {
        console.log("Error Uploading Video", error);
        // setLoading(false);
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  const generateNewTracks = useCallback(
    (tracks, prevTracks = [], count = 5) => {
      if (!tracks.length) {
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorTrackDetails: [],
            randomTrackSuffleloader: false,
          })
        );
        return;
      }

      const prevTrackSet = new Set(prevTracks.map((t) => t.objectID));

      let availableTracks = tracks.filter(
        (track) => !prevTrackSet.has(track.objectID)
      );
      if (availableTracks.length < count) {
        availableTracks = [...tracks];
      }

      for (let i = availableTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTracks[i], availableTracks[j]] = [
          availableTracks[j],
          availableTracks[i],
        ];
      }

      const newTracks = availableTracks.slice(
        0,
        Math.min(count, availableTracks.length)
      );

      dispatch(
        SET_AI_MUSIC_META({
          aiMusicGeneratorTrackDetails: newTracks,
          randomTrackSuffleloader: false,
        })
      );

      setPreviousTracks(newTracks);
    },
    [dispatch, setPreviousTracks]
  );

  const fetchLoopApi = (interval = 0) => {
    console.log("storeOldFlow", storeOldFlow);
    axiosCSPrivateInstance
      .get(`/ai_analysis/getTracksFromSS/${pollingID}`)
      .then((response) => {
        const data = response.data;

        const stopPolling = () => {
          clearInterval(interval);
          setLoading(false);
          // dispatch(RESET_LOADING_STATUS());
        };

        if (data?.status === "completed") {
          stopPolling();

          const parsedTracks = JSON.parse(data.trackData || "[]");
          const cleanedDescription =
            data?.description?.replace(/\\n/g, "") || "";

          setBrief(cleanedDescription);
          setResponseData(cleanedDescription);
          setStoreAllTrackDataFromSS(parsedTracks);

          dispatch(
            SET_AI_MUSIC_META({
              allTrackFromSSFromServer: parsedTracks,
              selectedAIMusicConfig: {
                mood: data.mood?.tag || "",
                genre: data.genre?.tag || "",
                tempo: data.tempo?.tag || "",
              },
              aiMusicGenerator: {
                id: data.id,
                status: data.status,
                mediatype: data.mediatype,
                projectFlow: storeOldFlow,
              },
              aiMusicGeneratorOption: storeOldFlow,
            })
          );

          // if (!aiMusicGeneratorTrackDetails?.length) {
          generateNewTracks(parsedTracks, []);
          // }

          setPollingID(null);
        } else if (data?.status === "failed") {
          stopPolling();

          showNotification("ERROR", "Status: Failed!");

          dispatch(
            SET_AI_MUSIC_META({
              aiMusicGeneratorTrackDetails: [],
              randomTrackSuffleloader: false,
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error in request:", error);

        clearInterval(interval);
        setLoading(false);
        dispatch(RESET_LOADING_STATUS());

        showNotification("ERROR", "Something went wrong!");

        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorTrackDetails: [],
            randomTrackSuffleloader: false,
          })
        );
      });
  };

  const isBlocked = useMemo(() => {
    const isTagFlow = ["tags"].includes(
      aiMusicGenerator?.projectFlow || aiMusicGeneratorOption
    );

    if (isTagFlow) {
      return !selectedGenre || !selectedMood || !selectedTempo;
    }

    if (loading) {
      return true;
    }
    if (
      storeAllTrackDataFromSS.length === 0 &&
      selectedGenre &&
      selectedMood &&
      selectedTempo
    ) {
      return false;
    }

    if (!storeAllTrackDataFromSS || storeAllTrackDataFromSS.length === 0) {
      return true;
    }

    return false;
  }, [
    aiMusicGenerator?.projectFlow,
    aiMusicGeneratorOption,
    selectedGenre,
    selectedMood,
    selectedTempo,
    loading,
    storeAllTrackDataFromSS,
  ]);

  useEffect(() => {
    if (!pollingID) return;
    setLoading(true);

    fetchLoopApi();

    const interval = setInterval(() => {
      fetchLoopApi(interval);
    }, 10000); // Retry every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [
    pollingID,
    activeWSTab,
    dispatch,
    navigate,
    projectID,
    aiMusicGeneratorOption,
  ]);

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
    }, 5000);
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

  const shouldDisable =
    !uploadedVideoBlobURL || videoLoader
      ? !!brief?.trim() || responseData === brief || loading
      : false;

  // const shouldDisableForBrief = (!uploadedVideoBlobURL || videoLoader)
  //   ? (!!brief?.trim() || loading)
  //   : responseData?.description === brief;
  const shouldDisableForBrief = !uploadedVideoBlobURL || videoLoader;

  const flow = aiMusicGenerator?.projectFlow || aiMusicGeneratorOption;

  // console.log('aiMusicGenerator?.projectFlow || aiMusicGeneratorOption', aiMusicGenerator?.projectFlow)
  // console.log('aiMusicGenerator?.projectFlow || aiMusicGeneratorOption', aiMusicGeneratorOption)
  // console.log('flow', flow)
  // console.log('responseData?.description === brief', responseData?.description === brief)

  console.log("responseData?.description == brief", responseData);
  console.log("responseData?.description == brief", brief);
  console.log("responseData?.description == brief", responseData === brief);

  return activeWSTab === "Voice" ? (
    <>
      <WSHeaderActionBtns />
      <div
        className="video_layout_containerForShell"
        id="video_layout_containerForShell"
      >
        <div
          className="content_container"
          style={{ width: uploadedVideoURL ? "65%" : "100%" }}
        >
          {children}
          <div
            className="video_layout_containerForShell_filler"
            id="video_layout_containerForShell_filler"
          />
        </div>
        {uploadedVideoURL && (
          <div className={`video_container`} style={{ width: "35%" }}>
            <button
              className="delete_icon_btn"
              // disabled={isVideoLoading || isVideoProcessing}
            >
              <IconWrapper
                icon="Trash"
                onClick={() => {
                  removeVideo(projectID);
                }}
              />
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
                    controlsList: "nodownload noplaybackrate noremoteplayback",
                    disablePictureInPicture: true,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
      {TTSTimelineVoicesMP3?.length !== 0 ||
      selectedAIMusicDetails?.cue_id ||
      uploadedVideoURL ? (
        <>
          <UpdateProjectLengthSameAsTTSVoicesModal />
          <Timeline />
        </>
      ) : null}
    </>
  ) : (
    <>
      <WSHeaderActionBtns />
      <div
        className="video_layout_container"
        id="video_layout_container"
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
          {uploadedVideoBlobURL && (
            <div className={`video_container`}>
              {param?.cue_id && videoLoader ? (
                <div className="video_container_loader">
                  <CustomLoaderSpinner />
                </div>
              ) : (
                <>
                  <button
                    className="delete_icon_btn"
                    disabled={isVideoLoading || isVideoProcessing || loading}
                  >
                    <IconWrapper
                      icon="Trash"
                      onClick={() => {
                        removeVideo(projectID);
                      }}
                    />
                  </button>
                  {isVideoLoading && (
                    <div
                      className="video_container_loader"
                      style={{ height: "300px", width: "35%" }}
                    >
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
                    height={"300px"}
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
                </>
              )}
            </div>
          )}
          <div className="container-brief">
            {!param?.cue_id && !uploadedVideoBlobURL && (
              <div
                className="section"
                // disabled={uploadedVideoBlobURL ? true : aiMusicGeneratorOption === "tags" ? true : false}
                // style={{
                //     cursor: !uploadedVideoBlobURL ? "not-allowed" : aiMusicGeneratorOption === "tags" ? "not-allowed" : "pointer",
                //     opacity: !uploadedVideoBlobURL ? 0.5 : aiMusicGeneratorOption === "tags" ? 0.5 : 1,
                //     pointerEvents: !uploadedVideoBlobURL ? "none" : aiMusicGeneratorOption === "tags" ? "none" : "auto",
                // }}
                style={{
                  cursor: shouldDisable ? "not-allowed" : "pointer",
                  opacity: shouldDisable ? 0.5 : 1,
                  pointerEvents: shouldDisable ? "none" : "auto",
                }}
                onClick={() => {
                  if (loading) return; // Prevent action when loading

                  dispatch(
                    SET_VIDEO_META({
                      videoNavigationTo: getWorkSpacePath(projectID, cueID),
                    })
                  );
                  // dispatch(
                  //   SET_AI_MUSIC_META({
                  //     // aiMusicGeneratorOption: "AIMusic"
                  //   })
                  // );

                  // navigate(NavStrings.UPLOAD_VIDEO, { state: { lastPage: aiMusicGenerator?.projectFlow || aiMusicGeneratorOption } });

                  navigate(NavStrings.UPLOAD_VIDEO, {
                    state: ["tags", "video", "brief"].includes(flow)
                      ? { lastPage: flow }
                      : { lastPage: "video" },
                  });
                }}
              >
                <div className="header">
                  <h1>Upload Video </h1>
                  <UploadArrow className="circle-button"> </UploadArrow>
                </div>
              </div>
            )}

            {!param?.cue_id &&
              !["tags"].includes(
                aiMusicGenerator?.projectFlow || aiMusicGeneratorOption
              ) && (
                <div className="section brief-section">
                  <h2>Brief </h2>
                  {/* <textarea
                      className="brief-textarea"
                      value={brief}
                      onChange={(e) => {
                        setBrief(e?.target?.value);
                      }}
                    /> */}
                  <TextAreaWrapper
                    className="brief-textarea"
                    value={brief}
                    disabled={uploadedVideoBlobURL || loading || videoLoader}
                    onChange={(e) => {
                      setBrief(e?.target?.value);
                    }}
                  />

                  <ButtonWrapper
                    className="upload-brief-button"
                    onClick={() => {
                      setTimeout(() => {
                        handleBriefSubmit();
                      }, 500);
                    }}
                    disabled={
                      !shouldDisableForBrief ||
                      loading ||
                      responseData === brief?.trim() ||
                      videoLoader ||
                      !brief?.trim()
                    }
                  >
                    <span>
                      <UploadArrow
                        className="circle-button"
                        style={{ width: "20px", height: "20px" }}
                      >
                        {" "}
                      </UploadArrow>
                    </span>
                    Upload Brief
                  </ButtonWrapper>
                </div>
              )}
            {!param?.cue_id && (
              <>
                <div className="section style-section">
                  <h2>Style </h2>
                  <div className="style-tags">
                    {selectedAIMusicConfig?.genre && (
                      <div className="tag-group">
                        <span className="tag-label boldFamily"> Genre </span>
                        <span className="style-selector__button">
                          {selectedAIMusicConfig?.genre}
                        </span>
                      </div>
                    )}
                    {selectedAIMusicConfig?.mood && (
                      <div className="tag-group">
                        <span className="tag-label boldFamily"> Mood </span>
                        <span className="style-selector__button">
                          {selectedAIMusicConfig?.mood}
                        </span>
                      </div>
                    )}
                    {selectedAIMusicConfig?.tempo && (
                      <div className="tag-group">
                        <span className="tag-label boldFamily"> Tempo </span>
                        <span className="style-selector__button">
                          {selectedAIMusicConfig?.tempo}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="settings-button"
                    onClick={() => setOpen(!open)}
                  >
                    Manual Settings
                    <ManualSettingArrow className="manual_setting_icon" />
                  </button>

                  {open && (
                    <div
                      style={{
                        borderTop: "1px solid var(--color-style-selection-bg)",
                        marginTop: "10px",
                        paddingTop: "20px",
                      }}
                    >
                      <SideBarMusicStyleSelector
                        setvariantList={setvariantList}
                        variantList={variantList}
                        selectedMood={selectedMood}
                        setSelectedMood={setSelectedMood}
                        setSelectedTempo={setSelectedTempo}
                        selectedTempo={selectedTempo}
                        GetTaskID={GetTaskID}
                        loadingConfig={loadingConfig}
                        setLoadingConfig={setLoadingConfig}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                        tempoOptions={tempoOptions}
                        setTempoOptions={setTempoOptions}
                      />
                    </div>
                  )}
                </div>

                <ButtonWrapper
                  variant="filled"
                  className="re-generate-button"
                  onClick={() => {
                    if (selectedGenre && selectedMood && selectedTempo) {
                      dispatch(
                        SET_AI_MUSIC_META({
                          selectedAIMusicConfig: {
                            genre: selectedGenre,
                            mood: selectedMood,
                            tempo: getTempoValue(selectedTempo),
                          },
                        })
                      );

                      GetTaskID(
                        selectedGenre,
                        selectedMood,
                        getTempoValue(selectedTempo)
                      );
                    } else {
                      // dispatch(UPDATE_SHUFFLED_TRACKS())
                      generateNewTracks(
                        storeAllTrackDataFromSS,
                        previousTracks
                      );
                    }
                  }}
                  disabled={isBlocked}
                >
                  {loading ? "Processing..." : "Re-generate"}
                </ButtonWrapper>
              </>
            )}
          </div>
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

      {TTSTimelineVoicesMP3?.length !== 0 ||
      selectedAIMusicDetails?.cue_id ||
      !!tXId ? (
        <>
          <UpdateProjectLengthSameAsTTSVoicesModal />
          <Timeline />
        </>
      ) : null}
    </>
  );
};

export default VideoLayout;
