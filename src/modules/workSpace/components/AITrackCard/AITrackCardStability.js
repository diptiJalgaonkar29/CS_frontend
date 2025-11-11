import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const AITrackCardStability = ({
  data,
  type,
  hideTrackTags = false,
  index = 0,
  onTrackSelect,
  showSelectedHighlighted = false,
  stabilityArr = [], // <-- Add this prop // extra code
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let { theme } = useConfig();
  const [playing, setplaying] = useState(false);
  const [curtime, setcurtime] = useState("00:00");
  const [duration, setduration] = useState("00:00");
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
  const { uploadedVideoURL } = useSelector((state) => state.video);
  const [isTrackLoading, setIsTrackLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [processStatusRegen, setProcessStatusRegen] = useState(false);
  const [processPercentRegen, setProcessPercentRegen] = useState(0);
  const [isCueModalOpen, setIsCueModalOpen] = useState(false);
  const wavesurferRef = useRef();

  // extra code------------------------------

  // Track which audio to play if multiple
  const [audioIndex, setAudioIndex] = useState(0);

  // Use objectURLArr if available, else fallback to data?.cue_audio_file_url
  const audioSrc =
    stabilityArr && stabilityArr.length > 0
      ? stabilityArr[audioIndex] || stabilityArr[0]
      : data?.cue_audio_file_url;
  //------------------------------------------
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

  const handleWSMount = useCallback(
    (waveSurfer) => {
      wavesurferRef.current = waveSurfer;
      if (!audioSrc) return; // extra code
      if (wavesurferRef.current) {
        wavesurferRef.current?.load(audioSrc); // extra code

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
          const video = document.querySelector("#project_video_v2 video");
          let seekTimeMove = e * wavesurferRef.current?.getDuration();
          if (video) {
            video.currentTime = seekTimeMove;
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
    [audioSrc] // extra code
  );

  // extra code----------------------------
  // If audioSrc changes, reload the audio
  useEffect(() => {
    if (wavesurferRef.current && audioSrc) {
      wavesurferRef.current.load(audioSrc);
    }
  }, [audioSrc]);
  //-------------------------------------------
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

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      handleWSMount(wavesurferRef.current);
    } else {
      didMount.current = true;
    }
  }, [uploadedVideoURL]);

  useEffect(() => {
    if (playedCueID !== data?.cue_id) {
      wavesurferRef.current?.pause();
      setplaying(false);
    }
  }, [playedCueID]);

  const play = useCallback(() => {
    if (playedCueID !== data?.cue_id) {
      dispatch(
        SET_AI_MUSIC_META({
          playedCueID: data?.cue_id,
          playedInstrument: null,
          playedSonicLogo: null,
        })
      );
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
  }, [playedCueID, data?.cue_id]);

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
      console.log("updatedInstruments", updatedInstruments);
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
                className={`track_like_dislike ${
                  type === "DASHBOARD_BLOCK" ? "dashbord_AICard" : ""
                }`}
              >
                <IconWrapper
                  icon="ThumbsUp"
                  className={`${isLikedTrack ? "liked" : ""}`}
                  onClick={() => {
                    likeDislikeTrack(data, "LIKE", isLikedTrack);
                  }}
                />
                <IconWrapper
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
              <IconWrapper
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
            </div>
            <div className="timestamp">
              <p className="curr-time">{curtime}</p>
              <p className="duration">{duration}</p>
            </div>
          </div>
          {type !== "DASHBOARD_BLOCK" && (
            <div className="selection">
              {showSelectedHighlighted &&
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITrackCardStability;
