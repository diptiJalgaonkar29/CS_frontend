import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import "./AITrackCard.css";
import { useConfig } from "../../../../customHooks/useConfig";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import formatTime from "../../../../utils/formatTime";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import { ReactComponent as Info } from "../../../../static/voice/info.svg";
import regenerateTrack from "../../services/TuneyAIMusic/regenerateTrack";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import likeDislikeAIMusic from "../../services/AIMusicDB/likeDislikeAIMusic";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { isEqual, last, reduce } from "lodash";
import getAIMusicEndingOption from "../../helperFunctions/getAIMusicEndingOption";
import divideDurationBySections from "../../../../utils/divideDurationBySections";
import { AIMusicActions } from "../../constants/AIMusicActions";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import NavStrings from "../../../../routes/constants/NavStrings";
import { SET_AI_MUSIC_Stability_META } from "../../redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../redux/AITrackStabilitySlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import DurationCounter from "../DurationCounter/DurationCounter";
import { Field, Formik } from "formik";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import RadioWrapper from "../../../../branding/componentWrapper/RadioWrapper";
import * as Yup from "yup";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import { RESET_LOADING_STATUS, SET_LOADING_STATUS } from "../../../../common/redux/loaderSlice";
import IconButtonWrapper from "../../../../branding/componentWrapper/IconButtonWrapper";

function EditTrackModal({ open, close, trackDuration, stabilityDataEditTrackModal }) {
  const MAX_DURATION = 60;
  const MIN_DURATION = 0;
  const param = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { uploadedVideoURL, uploadedVideoBlobURL } = useSelector((state) => state.video);
  const { projectID, projectDurationInsec, projectName, projectDescription } = useSelector((state) => state.projectMeta);
  const { stabilityMP3TracksArr } = useSelector((state) => state.AIMusicStability);

  function toSecondsFromObj(time) {
    return (time.minutes * 60) + time.seconds;
  }

  const generateBlob = async (allFileData) => {
    try {
      const fileRequests = stabilityMP3TracksArr.flat().map((file) =>
        axiosCSPrivateInstance.get(
          `/stability/GetMediaFile/${projectID}/${allFileData?.fileName}`,
          { responseType: "blob" }
        )
      );

      const results = await Promise.all(fileRequests);

      // Create object URLs for each blob
      const objectURLArr = results.map((res) => URL.createObjectURL(res.data));
      // console.log("Fetched all Stability MP3 files:", objectURLArr);
      // console.log("stabilityMP3TracksArr", stabilityMP3TracksArr)
      // console.log("allFileData?.fileName", allFileData?.fileName)
      // console.log("allFileData", allFileData)

      dispatch(RESET_LOADING_STATUS());
      // Dispatch here, where objectURLArr exists
      dispatch(
        SET_AI_MUSIC_Stability_META({ stabilityMP3TracksArr: [...stabilityMP3TracksArr, allFileData?.fileName], stabilityLoading: false })
      );
      dispatch(
        SET_AI_Track_Stability_META({ stabilityArr: objectURLArr, currentUseThisTrack: allFileData?.usedMp3 })
      );
      navigate(getWorkSpacePath(allFileData?.projectId, allFileData?.usedMp3))
      dispatch(RESET_LOADING_STATUS());
      close()
    } catch (err) {
      console.error("Failed to generate blob URLs:", err);
      dispatch(RESET_LOADING_STATUS());
    }
  };

  const callImpaint = (values) => {
    var formData = new FormData();
    console.log("value", +toSecondsFromObj(values?.duration))

    const matchedFiles = stabilityMP3TracksArr?.flat().filter(
      (item) =>
        item
          .replace(/\.mp3$/i, "")
          .split("_")
          .pop()
          .replace(/stability$/i, "") === param.cue_id
    );

    formData.append("audioFile", matchedFiles[0]);
    formData.append("duration", +toSecondsFromObj(values?.duration));

    axiosCSPrivateInstance.post("stability/inpaint", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Axios automatically sets the correct boundary
      }
    }).then((response) => {
      let data = response.data
      generateBlob(data)
    }).catch((error) => {
      console.log("error", error)
      showNotification("Something went wrong!")
      dispatch(RESET_LOADING_STATUS());
      close()
    })

  }

  function generateProjectLength(values) {
    if (toSecondsFromObj(values?.duration) >= projectDurationInsec) {
      dispatch(
        SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
      );
      // then just update track length and project durtion both

      let projectMeta = {
        duration: +toSecondsFromObj(values?.duration),
      };

      console.log("projectMeta", projectMeta)

      updateProjectMeta({
        projectID,
        projectMeta,
        onSuccess: () => {
          showNotification("SUCCESS", "Project length updated succesfully!");
          dispatch(
            SET_PROJECT_META({
              projectDurationInsec:
                +toSecondsFromObj(values?.duration),
              projectName: projectName,
              projectDescription: projectDescription,
            })
          );
          callImpaint(values)
        },
        onError: () => {
          dispatch(RESET_LOADING_STATUS());
        },
      });
      console.log("called from update project length and track length")
    } else {
      dispatch(
        SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
      );
      console.log("called from update track length")
      callImpaint(values)
    }
  }

  return (
    <ModalWrapper
      isOpen={open}
      onClose={close}
      title={"Edit track length"}
      className="editTrack_length_modal"
    >
      <Formik
        initialValues={{
          isSameAsVideoLength:
            !!uploadedVideoURL || !!uploadedVideoBlobURL ? "true" : "false",
          duration: {
            minutes: 0,
            seconds: 0,
          },
        }}
        validationSchema={Yup.object().shape({
          isSameAsVideoLength: Yup.string().required("Required"),
          // duration: Yup.object().shape({
          //   minutes: Yup.number()
          //     .min(0, "Must be at least 0")
          //     .max(3, "Cannot be more than 3 minutes")
          //     .required("Required"),
          //   seconds: Yup.number()
          //     .min(0, "Must be at least 0")
          //     .max(59, "Seconds must be 0-59")
          //     .required("Required"),
          // })
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
            handleChange,
            handleSubmit,
            setFieldValue,
          } = props;
          return (
            <form onSubmit={handleSubmit}>
              <div className="project_modal__duration_container" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                marginBottom: "15px"
              }}>
                <div className="project_length_container">
                  {/* <SonicInputLabel>Length of the project *</SonicInputLabel> */}
                  <div className="Form_radio_container">
                    <div className="main_duration_radio_container">
                      <Field
                        name="isSameAsVideoLength"
                        type="radio"
                        id="projectSettings_radio_false"
                        value="false"
                        component={RadioWrapper}
                        allowHtmlLabel={true}
                        disabled={
                          !!uploadedVideoURL || !!uploadedVideoBlobURL
                        }
                        label={
                          <DurationCounter
                            disabled={
                              !!uploadedVideoURL || !!uploadedVideoBlobURL
                            }
                            setFieldValue={setFieldValue}
                            values={values}
                          />
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              {toSecondsFromObj(values?.duration) > 180
                && (
                  <span style={{ color: "red", fontSize: "14px" }}>Track length should be less than 3 minutes.</span>
                )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <ButtonWrapper onClick={close}>Cancel</ButtonWrapper>
                <ButtonWrapper
                  variant="filled"
                  onClick={() => generateProjectLength(values)}
                  disabled={toSecondsFromObj(values?.duration) > 180}
                >
                  Save
                </ButtonWrapper>
              </div>
            </form>
          );
        }}
      </Formik>
    </ModalWrapper >
  )
}

const AITrackCard = ({
  data,
  type,
  hideTrackTags = false,
  index = 0,
  onTrackSelect,
  showSelectedHighlighted = false,
  stabilityArr = [],
  oldData = [],// <-- Add this prop // extra code
  mp3Url = []// <-- Add this prop // extra code
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const param = useParams()
  let { theme } = useConfig();
  const [playing, setplaying] = useState(false);
  const [curtime, setcurtime] = useState("00:00");
  const [duration, setduration] = useState("00:00");
  const [stabilityEditTrackModal, setStabilityEditTrackModal] = useState(false)
  const [stabilityDataEditTrackModal, setStabilityDataEditTrackModal] = useState(false)
  const {
    playedCueID,
    recentAIGeneratedData,
    selectedAIMusicDetails,
    likedAIMusicArr,
    dislikedAIMusicArr,
    SSflaxTrackID,
  } = useSelector((state) => state.AIMusic);
  const { projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const { uploadedVideoURL, uploadedVideoBlobURL } = useSelector((state) => state.video);
  const [isTrackLoading, setIsTrackLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [processStatusRegen, setProcessStatusRegen] = useState(false);
  const [processPercentRegen, setProcessPercentRegen] = useState(0);
  const [isCueModalOpen, setIsCueModalOpen] = useState(false);
  const wavesurferRef = useRef();
  const { brandMeta } = getCSUserMeta();
  const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);
  const sendAndCompareId = mp3Url.flat()[index]?.replace(/\.mp3$/i, '').split('_').pop().replace(/stability$/i, '')
  const { stabilityLoading } = useSelector((state) => state.AIMusicStability);

  // console.log("mp3Url", mp3Url);

  // extra code

  // Track which audio to play if multiple
  const [audioIndex, setAudioIndex] = useState(0);

  // Use objectURLArr if available, else fallback to data?.cue_audio_file_url
  const audioSrc =
    stabilityArr && stabilityArr.length > 0
      ? stabilityArr[audioIndex] || stabilityArr[0]
      : null;

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => {
        setProcessPercent(response.data.progress * 100);
        setProcessPercentRegen(response.data.progress * 100);
      },
      onSuccess: (response) => {
        onGenerateCueSuccess(response);
      },
      onError: () => setProcessStatus(false),
    });
  };

  const onGenerateCueSuccess = async (response) => {
    let trackTitle = data?.label || response?.data?.name;
    let trackDescription = data.desc || "-";
    const flaxId =
      (response?.data?.sections?.[0]?.flax_tracks?.[0] === "None"
        ? ""
        : response?.data?.sections?.[0]?.flax_tracks?.[0] || "") ||
      SSflaxTrackID;
    let AIMusicTrackDetails = [
      {
        mood: response?.data?.settings?.mood,
        genre: response?.data?.settings?.genre,
        tempo: response?.data?.settings?.tempo,
        length: response?.data?.settings?.length,
        name: trackTitle,
        description: trackDescription,
        cue_id: response?.data?.cue_id,
        parent_cue_id: response?.data?.parent_cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        action: AIMusicActions.APPLIED_CHANGES,
        project_id: projectID,
      },
    ];
    addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: response?.data?.cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        variantCueIds: JSON.stringify([
          {
            label: `${trackTitle}##applied changes`,
            value: response?.data?.cue_id,
            desc: trackDescription,
            parentCueId: response?.data?.parent_cue_id,
            action: AIMusicActions.APPLIED_CHANGES,
          },
        ]),
      },

      recentAIGeneratedData,
      onSuccess: () => {
        dispatch(
          SET_AI_MUSIC_META({
            previousCueID: selectedAIMusicDetails?.cue_id,
            redoCueID: null,
          })
        );
        onTrackSelect?.();
        navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
      },
    });
    setProcessStatus(false);
    setProcessPercent(0);

    setProcessStatusRegen(false);
    setProcessPercentRegen(0);
  };

  const sendDataAboutTrackToBk = (mp3URL, blobURL) => {
    // console.log("blobURL", blobURL?.replace(/\.mp3$/i, '').split('_').pop().replace(/stability$/i, ''))
    // console.log("mp3URL", mp3URL)
    if (mp3URL?.length === 0 || mp3URL?.length <= 1) return;
    let blobURLSplit = blobURL?.replace(/\.mp3$/i, '').split('_').pop().replace(/stability$/i, '') || "";
    axiosCSPrivateInstance
      .put(`/stability/updateStabilityById/${mp3URL}/${blobURLSplit}`)
      .then(async (response) => {
        dispatch(
          SET_AI_Track_Stability_META({ stabilityArr: [], currentUseThisTrack: blobURLSplit })
        );
        // dispatch(
        //   SET_AI_MUSIC_Stability_META({ latestStability: latestStability })
        // );
        navigate(getWorkSpacePath(projectID, blobURLSplit));
      })
      .catch((error) => {
        console.error("Error in Stability AI Music Response:", error);
        showNotification("ERROR", "Something went wrong!");
      })
  }

  const handleWSMount = useCallback(
    (waveSurfer) => {
      wavesurferRef.current = waveSurfer;
      if (!data?.cue_audio_file_url) return;
      if (wavesurferRef.current) {
        wavesurferRef.current?.load(data?.cue_audio_file_url);

        wavesurferRef.current?.on("ready", (e) => {
          setduration(
            formatTime(Math.round(wavesurferRef.current?.getDuration()))
          );
          setIsTrackLoading(false);
        });
        wavesurferRef.current?.on("audioprocess", () => {
          setcurtime(formatTime(wavesurferRef.current?.getCurrentTime()));
        });
        wavesurferRef.current?.on("loading", (e) => {
          setLoadingPercent(e);
        });
        wavesurferRef.current?.on("finish", () => {
          wavesurferRef.current?.seekTo(0);
          const video = document.querySelector("#project_video_v2 video");
          if (video) {
            video.currentTime = 0;
            video.pause();
          }
        });
        wavesurferRef.current.on("seek", (e) => {
          setcurtime(formatTime(e * wavesurferRef.current?.getDuration()));

          // if (!wavesurferRef.current.isPlaying()) return;

          const video = document.querySelector("#project_video_v2 video");
          let seekTimeMove = e * wavesurferRef.current?.getDuration();

          if (video) {
            video.currentTime = seekTimeMove;

            // Resume video only if within video duration and audio is playing
            if (
              seekTimeMove < video.duration &&
              video.paused &&
              wavesurferRef.current.isPlaying()
            ) {
              video
                .play()
                .catch((err) => console.warn("Video play error", err));
            }
          }
        });
        if (window) {
          window.surferidze = wavesurferRef.current;
        }
      }
    },
    [data?.cue_audio_file_url]
  );

  const handleWSMountStability = useCallback(
    (waveSurfer) => {
      wavesurferRef.current = waveSurfer;
      if (!audioSrc) return;
      if (wavesurferRef.current) {
        wavesurferRef.current?.load(audioSrc);

        wavesurferRef.current?.on("ready", (e) => {
          setduration(
            formatTime(Math.round(wavesurferRef.current?.getDuration()))
          );
          setIsTrackLoading(false);
        });
        wavesurferRef.current?.on("audioprocess", () => {
          setcurtime(formatTime(wavesurferRef.current?.getCurrentTime()));
        });
        wavesurferRef.current?.on("loading", (e) => {
          setLoadingPercent(e);
        });
        wavesurferRef.current?.on("finish", () => {
          wavesurferRef.current?.seekTo(0);
          const video = document.querySelector("#project_video_v2 video");
          if (video) {
            video.currentTime = 0;
            video.pause();
          }
        });
        wavesurferRef.current.on("seek", (e) => {
          setcurtime(formatTime(e * wavesurferRef.current?.getDuration()));

          // if (!wavesurferRef.current.isPlaying()) return;

          const video = document.querySelector("#project_video_v2 video");
          let seekTimeMove = e * wavesurferRef.current?.getDuration();

          if (video) {
            video.currentTime = seekTimeMove;

            // Resume video only if within video duration and audio is playing
            if (
              seekTimeMove < video.duration &&
              video.paused &&
              wavesurferRef.current.isPlaying()
            ) {
              video
                .play()
                .catch((err) => console.warn("Video play error", err));
            }
          }
        });
        if (window) {
          window.surferidze = wavesurferRef.current;
        }
      }
      // console.log('called2 :>> ');
    },
    [audioSrc]
  );

  useEffect(() => {
    if (!wavesurferRef.current?.isReady) return;

    const extendAudioWithSilence = async (
      buffer,
      originalDuration,
      targetDuration
    ) => {
      console.log("extendAudioWithSilence called");

      const audioCtx = new (window?.AudioContext ||
        window?.webkitAudioContext)();
      const sampleRate = buffer.sampleRate;
      const originalLength = buffer.length;
      const additionalLength = Math.floor(
        (targetDuration - originalDuration) * sampleRate
      );

      if (additionalLength <= 0) return buffer; // No need to extend

      //  Instead of multiplying, just add required silence
      const extendedBuffer = audioCtx.createBuffer(
        1,
        originalLength + additionalLength,
        sampleRate
      );
      const originalData = buffer.getChannelData(0);
      const extendedData = extendedBuffer.getChannelData(0);

      //  Copy original audio data
      extendedData.set(originalData, 0);
      return extendedBuffer;
    };

    const extendAudioIfNeeded = async () => {
      // console.log("extendAudioIfNeeded called", wavesurferRef.current?.isReady);
      const originalDuration = roundUpToDecimal(
        wavesurferRef.current?.getDuration()
      );
      const targetDuration = roundUpToDecimal(projectDurationInsec);

      // console.log("targetDuration", targetDuration);
      // console.log("originalDuration", originalDuration);
      if (originalDuration < targetDuration) {
        try {
          const extended = await extendAudioWithSilence(
            wavesurferRef.current.backend.buffer,
            originalDuration,
            targetDuration
          );
          wavesurferRef.current.loadDecodedBuffer(extended);
          wavesurferRef.current.drawBuffer();
        } catch (error) {
          console.error("Error extending audio:", error);
        }
      }
    };

    if (type !== "DASHBOARD_BLOCK") return;
    extendAudioIfNeeded();
  }, [projectDurationInsec, wavesurferRef.current?.isReady]);

  useEffect(() => {
    if (brandMeta?.aiMusicProvider !== "stability") return;

    if (audioSrc && wavesurferRef.current) {
      wavesurferRef.current.load(audioSrc);
      wavesurferRef.current?.on("ready", (e) => {
        setduration(
          formatTime(Math.round(wavesurferRef.current?.getDuration()))
        );
        setIsTrackLoading(false);
      });
    }
  }, [audioSrc]);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      if (brandMeta?.aiMusicProvider == "stability") {
        handleWSMountStability(wavesurferRef.current);
      } else {
        handleWSMount(wavesurferRef.current);
      }
    } else {
      didMount.current = true;
    }
  }, [uploadedVideoURL]);

  useEffect(() => {
    if (brandMeta?.aiMusicProvider == "stability") {
      if (playedCueID !== audioSrc?.split('/').pop()) {
        wavesurferRef.current?.pause();
        setplaying(false);
      }
    } else {
      if (playedCueID !== data?.cue_id) {
        wavesurferRef.current?.pause();
        setplaying(false);
      }
    }
  }, [playedCueID]);

  const play = useCallback(() => {
    if (brandMeta?.aiMusicProvider === "stability") {
      if (playedCueID !== audioSrc?.split('/').pop()) {
        dispatch(
          SET_AI_MUSIC_META({
            playedCueID: audioSrc?.split('/').pop(),
            playedInstrument: null,
            playedSonicLogo: null,
          })
        );
      }
    } else {
      if (playedCueID !== data?.cue_id) {
        dispatch(
          SET_AI_MUSIC_META({
            playedCueID: data?.cue_id,
            playedInstrument: null,
            playedSonicLogo: null,
          })
        );
      }
    }

    wavesurferRef.current?.playPause();
    console.log("isPlaying", wavesurferRef.current?.isPlaying());
    setplaying(wavesurferRef.current?.isPlaying());

    const video = document.querySelector("#project_video_v2 video");
    if (!video) return;
    const audioTime = wavesurferRef.current.getCurrentTime();
    video.currentTime = audioTime;
    if (!wavesurferRef.current?.isPlaying()) {
      video.pause();
    } else {
      video.play();
    }
  }, [playedCueID, data?.cue_id, audioSrc]);

  const onposchange = useCallback(() => {
    wavesurferRef.current?.on("finish", () => {
      setplaying(false);
      setcurtime(formatTime(0));
    });
    setcurtime(formatTime(wavesurferRef.current?.getCurrentTime()));
  }, []);

  const UpdateOnly = () => {
    if (!data) return;
    const {
      bpm = "",
      key = "",
      image_url = "",
      peaks = [],
      ...restData
    } = data;
    dispatch(
      SET_AI_MUSIC_META({
        selectedAIMusicDetails: restData,
        trackDuration: restData?.settings?.length,
        dropPosition:
          restData?.cue_parameters?.transition?.time ||
          restData?.settings?.length * 0.25,
        stemVolume: restData?.volumes?.[0],
        isDrop: Boolean(restData?.cue_parameters?.transition?.time),
        endingOption: getAIMusicEndingOption(last(restData?.sections)?.ending)
          ?.value,
        sonicLogoId: restData?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flaxTrackID:
          restData?.sections?.[0]?.flax_tracks?.[0] === "None"
            ? ""
            : restData?.sections?.[0]?.flax_tracks?.[0] || "",
        cueID: restData?.cue_id,
        playedInstrument: null,
        playedCueID: null,
        playedSonicLogo: null,
      })
    );
    onTrackSelect?.();
    const flaxId =
      (restData?.sections?.[0]?.flax_tracks?.[0] === "None"
        ? ""
        : restData?.sections?.[0]?.flax_tracks?.[0] || "") || SSflaxTrackID;
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: restData?.cue_id,
        sonic_logo_id: restData?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
      },
      recentAIGeneratedData,
      onSuccess: () => {
        setIsCueModalOpen(false);
        navigate(getWorkSpacePath(projectID, data?.cue_id));
      },
    });
  };

  const SelectedTrack = () => {
    if (!data) return;
    const {
      bpm = "",
      key = "",
      image_url = "",
      peaks = [],
      ...restData
    } = data;

    setProcessStatus(true);
    setProcessPercent(0);

    let hasDropOnCurrentAITrack = Boolean(
      selectedAIMusicDetails?.cue_parameters?.transition?.time
    );
    const currentDropTime =
      selectedAIMusicDetails?.cue_parameters?.transition?.time;
    const currentSonicLogoId =
      selectedAIMusicDetails?.custom_stems?.cue_logo?.[0]?.effect_id;
    const currentEnding = getAIMusicEndingOption(
      last(selectedAIMusicDetails?.sections)?.ending
    )?.value;

    let modArray = [];

    if (currentSonicLogoId) {
      modArray?.push({
        section: "all",
        type: "ending",
        value: "logo",
        param1: currentSonicLogoId,
      });
    }

    if (hasDropOnCurrentAITrack) {
      modArray?.push(
        {
          section: "0",
          type: "length",
          value: currentDropTime + "",
        },
        {
          section: "1",
          type: "length",
          value: projectDurationInsec - currentDropTime + "",
        }
      );
    } else {
      modArray?.push({
        section: "0",
        type: "split",
        value: currentDropTime + "",
      });
    }

    const isInstrumentUpdated = !isEqual(
      restData?.volumes?.[0],
      selectedAIMusicDetails?.volumes?.[0]
    );
    if (isInstrumentUpdated) {
      let updatedInstruments = reduce(
        restData?.volumes?.[0],
        (result, value, key) => {
          if (!isEqual(selectedAIMusicDetails?.volumes?.[0][key], value)) {
            result[key] = value;
          }
          return result;
        },
        {}
      );
      // console.log("updatedInstruments", updatedInstruments);
      for (const key in updatedInstruments) {
        if (Object.prototype.hasOwnProperty.call(updatedInstruments, key)) {
          const volume = updatedInstruments[key];
          modArray?.push({
            section: "all",
            type: "volume",
            value: volume + "",
            param1: key,
          });
        }
      }
    }

    if (projectDurationInsec !== restData?.settings?.length) {
      let newModArr = divideDurationBySections(
        selectedAIMusicDetails?.sections?.length,
        projectDurationInsec,
        currentDropTime
      )?.map((sectionLength, index) => ({
        section: index + "",
        type: "length",
        value: sectionLength + "",
      }));
      modArray?.push(...newModArr);
    }

    let regenObj = {
      mods: modArray,
    };
    setProcessStatusRegen(true);
    setProcessPercentRegen(0);
    setIsCueModalOpen(false);

    regenerateTrack({
      cueID: restData?.cue_id,
      config: regenObj,
      onSuccess: (response) => generateCueID(response.data.task_id),
      onError: () => {
        setProcessStatus(false);
        setProcessStatusRegen(false);
      },
    });
  };

  const CheckStatus = () => {
    let isDropAdded = Boolean(
      selectedAIMusicDetails?.cue_parameters?.transition?.time
    );
    let isInstrumentEdited = !Object?.values(
      selectedAIMusicDetails?.volumes?.[0]
    )?.every((value) => +value === 1);

    // console.log("isDropAdded", isDropAdded);
    // console.log("isInstrumentEdited", isInstrumentEdited);

    return isDropAdded || isInstrumentEdited;
  };

  const renderToolTip = (description) => {
    return (
      <div className="track_info_tooltip_container">
        <b>Description:</b>
        <p>{description || "-"}</p>
      </div>
    );
  };

  const likeDislikeTrack = (data, action, isAlreadyLikedOrDislike) => {
    const likeDislikeAIMusicMeta = {
      project_id: projectID,
      cue_id: data?.cue_id,
      genre: data?.settings?.genre,
      mood: data?.settings?.mood,
      tempo: data?.settings?.tempo,
      status: isAlreadyLikedOrDislike ? "2" : action === "LIKE" ? "1" : "0", // 0: dislike, 1: like, 2: NA
    };
    likeDislikeAIMusic({ likeDislikeAIMusicMeta });
  };

  const isLikedTrack = likedAIMusicArr?.includes(data?.cue_id);
  const isDislikedTrack = dislikedAIMusicArr?.includes(data?.cue_id);

  const editTrackDataPassToBackend = async (fileName, duration) => {
    setStabilityEditTrackModal(true)
    setStabilityDataEditTrackModal({
      fileName: fileName,
      duration: duration
    })
  }

  return (
    <div className="cue_variant_block" data-type={data?.type}>
      {(processStatus || processStatusRegen) && (
        <CustomLoader processPercent={processPercent || processPercentRegen} />
      )}
      <ModalWrapper
        isOpen={isCueModalOpen}
        onClose={() => setIsCueModalOpen(false)}
        title="Select Variant"
      >
        <div className="cue_modal">
          {/* <p className="cue_modal_header">Select Variant</p> */}
          <p className="cue_modal_content">
            Do you want to apply the pre-existing properties (drop, instruments)
            to it?
          </p>
          {/* <p className="cue_modal_content">
            By Clicking "No" only the track will be selected without properties
          </p> */}
          <div className="cue_modal_btns">
            <ButtonWrapper
              // style={{ width: "150px" }}
              onClick={() => {
                setIsCueModalOpen(false);
              }}
            >
              Cancel
            </ButtonWrapper>
            <ButtonWrapper
              onClick={UpdateOnly}
              style={{ color: "var(--color-primary) !important" }}
              className="primary_border"
            >
              Use Default
            </ButtonWrapper>
            <ButtonWrapper
              variant="filled"
              onClick={SelectedTrack}
              style={{
                color: "white",
              }}
            >
              Apply Changes
            </ButtonWrapper>
          </div>
        </div>
      </ModalWrapper>
      <div
        onClick={onposchange}
        className="wavesurfer"
        style={{
          border:
            showSelectedHighlighted &&
              selectedAIMusicDetails?.cue_id &&
              data?.cue_id == selectedAIMusicDetails?.cue_id
              ? "1px solid var(--color-primary)"
              : "none",
        }}
      >
        <div
          className="header_container"
          style={{
            width:
              type !== "DASHBOARD_BLOCK"
                ? "calc(100% - 200px)"
                : "calc(100% - 25px)",
          }}
        >
          <p
            className="track_name boldFamily"
            data-key={data?.settings?.key}
            data-cue-id={data?.cue_id}
          >
            {isTrackLoading ? "" : data?.label?.split("##")?.[0] || data?.name}
            {!!data?.label?.split("##")?.[1] &&
              !isTrackLoading &&
              type !== "DASHBOARD_BLOCK" && (
                <span className="track_action">
                  &nbsp;&nbsp;&#40;{data?.label?.split("##")?.[1]}
                  &#41;
                </span>
              )}
          </p>
          <div className="track_tags">
            {hideTrackTags ? (
              <p className="track_tag">{data?.settings?.tempo}</p>
            ) : (
              <>
                {/* {isDevServer && (
                  <p className="track_tag">{data?.settings?.key}</p>
                )} */}
                <p className="track_tag">{data?.settings?.genre}</p>
                <p className="track_tag">{data?.settings?.mood}</p>
                <p className="track_tag">{data?.settings?.tempo}</p>
                {!!data?.desc && (
                  <CustomToolTip
                    title={renderToolTip(data?.desc)}
                    placement="bottom"
                  >
                    {/* <IconWrapper
                      icon={"Info"}
                      className="track_info_tooltip voice_card_icon_large"
                      /> */}
                    <Info className="track_info_tooltip voice_card_icon_large" />
                  </CustomToolTip>
                )}
              </>
            )}
            {!!data && (
              <div
                className={`track_like_dislike ${type === "DASHBOARD_BLOCK" ? "dashbord_AICard" : ""
                  }`}
              >
                <IconButtonWrapper
                  icon="ThumbsUp"
                  className={`${isLikedTrack ? "liked" : ""}`}
                  onClick={() => {
                    likeDislikeTrack(data, "LIKE", isLikedTrack);
                  }}
                />
                <IconButtonWrapper
                  icon="ThumbsDown"
                  className={`${isDislikedTrack ? "disliked" : ""}`}
                  onClick={() => {
                    likeDislikeTrack(data, "DISLIKE", isDislikedTrack);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="main_container">
          <div
            className="play_pause_btn"
            style={{
              cursor: isTrackLoading ? "progress" : "pointer",
            }}
          >
            <button
              className="play_pause_cue_icon"
              disabled={isTrackLoading}
              onClick={play}
            >
              <IconButtonWrapper
                icon={!playing ? "BorderedPlay" : "BorderedPause"}
                className={`ctrlbtn`}
              />
            </button>
          </div>
          <div
            className="wave"
            style={{
              width: type !== "DASHBOARD_BLOCK" ? "calc(100% - 210px)" : "98%",
              position: "relative",
            }}
          >
            <div
              className="cue_variant_spinner_container"
              style={{ display: isTrackLoading ? "flex" : "none" }}
            >
              <CustomLoaderSpinner
                style={{
                  scale: "0.8",
                  position: "relative",
                  top: "-6px",
                }}
                processPercent={loadingPercent}
              />
            </div>
            <div style={{ height: "60px", overflow: "hidden" }}>
              {
                brandMeta?.aiMusicProvider === "stability" ? (
                  <WaveSurfer
                    id={`waveSurfer_${audioSrc?.split('/').pop()}_${index}`}
                    onMount={handleWSMountStability}
                  >
                    <WaveForm
                      container={`#waveSurfer${audioSrc?.split('/').pop()}_${index}`}
                      barWidth={1}
                      barRadius={1}
                      barGap={5}
                      barMinHeight={2}
                      cursorWidth={1}
                      progressColor={theme?.["--color-wave-progress"]}
                      waveColor={theme?.["--color-wave-bg"]}
                      width={"100%"}
                      height={60}
                      hideScrollbar
                      responsive
                      id={`waveform_${audioSrc?.split('/').pop()}_${index}`}
                    />
                  </WaveSurfer>
                ) : (
                  <WaveSurfer
                    id={`waveSurfer_${data?.cue_id}_${index}`}
                    onMount={handleWSMount}
                  >
                    <WaveForm
                      container={`#waveSurfer${data?.cue_id}_${index}`}
                      barWidth={1}
                      barRadius={1}
                      barGap={5}
                      barMinHeight={2}
                      cursorWidth={1}
                      progressColor={theme?.["--color-wave-progress"]}
                      waveColor={theme?.["--color-wave-bg"]}
                      width={"100%"}
                      height={60}
                      hideScrollbar
                      responsive
                      id={`waveform_${data?.cue_id}_${index}`}
                    />
                  </WaveSurfer>
                )
              }
            </div>
            <div className="timestamp">
              <p className="curr-time">{curtime}</p>
              <p className="duration">{duration}</p>
            </div>
          </div>
          {(brandMeta?.aiMusicProvider == "stability" && !!param?.cue_id) && (
            <div className="selection">
              <ButtonWrapper
                onClick={() => editTrackDataPassToBackend(mp3Url.flat()?.[index], projectDurationInsec)}
                className="primary_border frashlyMadeButton"
                disabled={
                  !!uploadedVideoURL || !!uploadedVideoBlobURL
                }
              >
                Edit track
              </ButtonWrapper>
            </div>
          )}
          {type !== "DASHBOARD_BLOCK" && (
            <div className="selection">
              {brandMeta?.aiMusicProvider == "stability" ?
                (sendAndCompareId === currentUseThisTrack ? (
                  <ButtonWrapper
                    onClick={() =>
                      navigate(getWorkSpacePath(projectID, sendAndCompareId))
                    }
                  >
                    Keep Selection
                  </ButtonWrapper>
                ) : (
                  <ButtonWrapper
                    onClick={() => sendDataAboutTrackToBk(mp3Url.flat()?.[index], mp3Url.flat()[index])}
                    className="primary_border frashlyMadeButton"
                    disabled={!!stabilityLoading}
                  >
                    Use this track
                  </ButtonWrapper>
                )) : (
                  showSelectedHighlighted &&
                    selectedAIMusicDetails?.cue_id &&
                    data?.cue_id == selectedAIMusicDetails?.cue_id ? (
                    <ButtonWrapper
                      onClick={() =>
                        navigate(
                          getWorkSpacePath(
                            projectID,
                            selectedAIMusicDetails?.cue_id
                          )
                        )
                      }
                    // style={{ width: "150px" }}
                    >
                      Keep Selection
                    </ButtonWrapper>
                  ) : (
                    <ButtonWrapper
                      onClick={() =>
                        selectedAIMusicDetails?.cue_id &&
                          CheckStatus() &&
                          type === "VARIANT_BLOCK"
                          ? setIsCueModalOpen(true)
                          : UpdateOnly()
                      }
                      // style={{ width: "150px" }}
                      className="primary_border frashlyMadeButton"
                    >
                      Use this track
                    </ButtonWrapper>
                  ))
              }
            </div>
          )}
        </div>
      </div>
      <EditTrackModal
        open={stabilityEditTrackModal}
        close={() => setStabilityEditTrackModal(false)}
        trackDuration={duration}
        stabilityDataEditTrackModal={stabilityDataEditTrackModal}
      />
    </div >
  );
};


export default AITrackCard;
