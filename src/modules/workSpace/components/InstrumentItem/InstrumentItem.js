import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../../../customHooks/useConfig";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import "./InstrumentItem.css";
import Close from "../../../../static/common/close.svg";
import NavStrings from "../../../../routes/constants/NavStrings";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import regenerateTrack from "../../services/TuneyAIMusic/regenerateTrack";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import showNotification from "../../../../common/helperFunctions/showNotification";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import wordCapitalizer from "../../../../utils/wordCapitalizer";
import { AIMusicActions } from "../../constants/AIMusicActions";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import SliderInputWrapper from "../../../../branding/componentWrapper/SliderInputWrapper";
import IconButtonWrapper from "../../../../branding/componentWrapper/IconButtonWrapper";

const InstrumentItem = (props) => {
  const {
    playedInstrument,
    selectedAIMusicDetails,
    recentAIGeneratedData,
    SSflaxTrackID,
    stemVolume,
  } = useSelector((state) => state.AIMusic);
  const { uploadedVideoURL } = useSelector((state) => state.video);
  const dispatch = useDispatch();
  const { theme } = useConfig();
  const navigate = useNavigate();
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [isTrackLoading, setIsTrackLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);

  useEffect(() => {
    if (
      playedInstrument !==
      `${selectedAIMusicDetails.cue_id}-${props?.instrument}`
    ) {
      wavesurferRef.current?.pause();
      setplaying(false);
    }
  }, [playedInstrument]);

  const getRegenTaskID = (action, instrument, instrumentKey) => {
    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: null,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    setProcessStatus(true);

    let instrumentObj = {
      mods: [
        action === "mute"
          ? {
              section: "all",
              type: "volume",
              value: "0",
              param1: instrumentKey,
            }
          : {
              section: "all",
              type: action,
              value: instrumentKey,
            },
      ],
    };

    regenerateTrack({
      cueID: selectedAIMusicDetails?.cue_id,
      config: instrumentObj,
      onSuccess: (response) =>
        generateCueID(response.data.task_id, instrument, action),
      onError: () => setProcessStatus(false),
    });
  };

  const onGenerateCueSuccess = async (
    response,
    changedInstrument,
    editAction
  ) => {
    let trackTitle =
      selectedAIMusicDetails?.label?.split("##")?.[0] || response?.data?.name;
    let trackDescription = selectedAIMusicDetails.desc || "-";
    const action = `${changedInstrument} ${
      editAction === "resample" ? "remixed" : "muted"
    }`;
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
        action: `${
          editAction === "resample"
            ? AIMusicActions.REMIX_INSTRUMENT
            : AIMusicActions.MUTE_INSTRUMENT
        }`,
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
            label: `${trackTitle}##${action}`,
            value: response?.data?.cue_id,
            desc: trackDescription,
            parentCueId: response?.data?.parent_cue_id,
            action: `${
              editAction === "resample"
                ? AIMusicActions.REMIX_INSTRUMENT
                : AIMusicActions.MUTE_INSTRUMENT
            }`,
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
        showNotification(
          "SUCCESS",
          `${wordCapitalizer(changedInstrument)} ${
            editAction === "resample" ? "remixed" : "muted"
          } succesfully!`
        );
        navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
      },
    });
    setProcessStatus(false);
    setProcessPercent(0);
  };

  const generateCueID = (taskID, changedInstrument, editAction) => {
    generateCue({
      taskID,
      onProgress: (response) => setProcessPercent(response.data.progress * 100),
      onSuccess: (res) =>
        onGenerateCueSuccess(res, changedInstrument, editAction),
      onError: () => {
        setProcessStatus(false);
        setProcessPercent(0);
      },
    });
  };

  const [playing, setplaying] = useState(false);
  const [isErroredFile, setIsErroredFile] = useState(false);

  const wavesurferRef = useRef();

  const handleWSMount = useCallback(
    (waveSurfer) => {
      if (props?.fileUrl) {
        wavesurferRef.current = waveSurfer;
        if (wavesurferRef.current) {
          wavesurferRef.current.load(props?.fileUrl);
          wavesurferRef.current.on("error", (e) => {
            console.log("Error", e);
            setIsErroredFile(true);
          });
          wavesurferRef.current?.on("ready", (e) => {
            setIsTrackLoading(false);
          });
          wavesurferRef.current?.on("loading", (e) => {
            setLoadingPercent(e);
          });
          wavesurferRef.current.on("finish", () => {
            wavesurferRef.current?.seekTo(0);
            setplaying(false);
          });

          if (window) {
            window.surferidze = wavesurferRef.current;
          }
        }
      }
    },
    [props?.fileUrl]
  );

  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      handleWSMount(wavesurferRef.current);
    } else {
      didMount.current = true;
    }
  }, [uploadedVideoURL]);

  const play = useCallback(() => {
    if (
      playedInstrument !==
      `${selectedAIMusicDetails?.cue_id}-${props?.instrument}`
    ) {
      dispatch(
        SET_AI_MUSIC_META({
          playedInstrument: `${selectedAIMusicDetails?.cue_id}-${props?.instrument}`,
          playedCueID: null,
          playedSonicLogo: null,
        })
      );
    }
    setplaying(!wavesurferRef?.current?.isPlaying());
    wavesurferRef.current.playPause();
  }, [playedInstrument, props?.instrument]);

  if (!props.fileUrl) {
    return;
  }

  return (
    <>
      {processStatus && <CustomLoader processPercent={processPercent} />}
      <div
        className="instrument-wavesurfer"
        style={{ display: isErroredFile ? "none" : "flex" }}
      >
        <CustomToolTip title={props?.instrument}>
          <p className="instrument_title">{props?.instrument}</p>
        </CustomToolTip>
        <IconButtonWrapper
          icon={!playing ? "BorderedPlay" : "BorderedPause"}
          className={`instrument-ctrlbtn`}
          onClick={play}
        />
        <div className="instrument-wave">
          <div
            className="instrument_wave_spinner_container"
            style={{ display: isTrackLoading ? "flex" : "none" }}
          >
            <CustomLoaderSpinner
              style={{
                scale: "0.5",
                position: "relative",
                top: "-16px",
              }}
              processPercent={loadingPercent}
            />
          </div>
          <WaveSurfer onMount={handleWSMount}>
            <WaveForm
              barWidth={0.2}
              barRadius={1}
              barGap={5}
              hideScrollbar
              barMinHeight={2}
              cursorWidth={1}
              progressColor={theme?.["--color-wave-progress"]}
              waveColor={theme?.["--color-wave-bg"]}
              width={0.2}
              height={50}
              responsive
              id={`instrumentwaveform${props?.index}`}
            ></WaveForm>
          </WaveSurfer>
        </div>
        <ButtonWrapper
          size="s"
          data-action="resample"
          data-instrument={props?.instrument}
          onClick={() =>
            getRegenTaskID("resample", props?.instrument, props?.instrumentKey)
          }
        >
          Remix
        </ButtonWrapper>
        <div className="instrument_volume_slider_wrapper">
          <CustomToolTip
            title={
              <div className={`instrument_volume_slider_container`}>
                <SliderInputWrapper
                  datalistArray={[
                    { value: 0.1, label: "- Low" },
                    { value: 0.5, label: "- Medium" },
                    { value: 1, label: "-  High" },
                  ]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={stemVolume?.[props?.instrumentKey]}
                  onChange={(vol) => {
                    wavesurferRef?.current?.setVolume(vol);
                    dispatch(
                      SET_AI_MUSIC_META({
                        stemVolume: {
                          ...stemVolume,
                          [props?.instrumentKey]: +vol,
                        },
                      })
                    );
                  }}
                />
                <IconButtonWrapper
                  className={`instrument_volume_speaker_icon`}
                  icon={
                    +stemVolume?.[props?.instrumentKey] === 0
                      ? "SpeakerMute"
                      : "Speaker"
                  }
                />
                <span className="slider_value_tooltip">{stemVolume?.[props?.instrumentKey]}</span>
              </div>
            }
            placement="bottom"
          >
            <div style={{ width: "22px", height: "22px" }}>
              <IconButtonWrapper
                className={`instrument_volume_speaker_icon`}
                icon={
                  +stemVolume?.[props?.instrumentKey] === 0
                    ? "SpeakerMute"
                    : "Speaker"
                }
              />
            </div>
          </CustomToolTip>
        </div>

        <button
          style={{
            background: "transparent",
            border: "none",
            width: "12px",
            height: "12px",
          }}
          onClick={() =>
            props?.instrument !== "melodies"
              ? getRegenTaskID("mute", props?.instrument, props?.instrumentKey)
              : null
          }
        >
          {props?.instrument !== "melodies" ? (
            <IconButtonWrapper icon="Close" className="close_icon" />
          ) : (
            <></>
          )}
        </button>
      </div>
    </>
  );
};

export default InstrumentItem;
