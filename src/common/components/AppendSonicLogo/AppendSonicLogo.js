import React, { useCallback, useEffect, useRef, useState } from "react";
import { TfiZoomIn, TfiZoomOut } from "react-icons/tfi";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import { useConfig } from "../../../customHooks/useConfig";
import "./AppendSonicLogo.css";
import { useDispatch, useSelector } from "react-redux";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import formatTime from "../../../utils/formatTime";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import { SET_AI_MUSIC_META } from "../../../modules/workSpace/redux/AIMusicSlice";
import { SET_PROJECT_META } from "../../../modules/workSpace/redux/projectMetaSlice";
import { useNavigate } from "react-router-dom";
import regenerateTrack from "../../../modules/workSpace/services/TuneyAIMusic/regenerateTrack";
import addAIMusicResponse from "../../../modules/workSpace/services/AIMusicDB/addAIMusicResponse";
import updateAIMusicMeta from "../../../modules/workSpace/services/AIMusicDB/updateAIMusicMeta";
import showNotification from "../../helperFunctions/showNotification";
import getWorkSpacePath from "../../../utils/getWorkSpacePath";
import generateCue from "../../../modules/workSpace/services/TuneyAIMusic/generateCue";
import CustomLoader from "../customLoader/CustomLoader";
import ReactPlayer from "react-player";
import divideDurationBySections from "../../../utils/divideDurationBySections";
import { throttle } from "lodash";
import getTrackDetailsByCueID from "../../../modules/workSpace/services/TuneyAIMusic/getTrackDetailsByCueID";
import { AIMusicActions } from "../../../modules/workSpace/constants/AIMusicActions";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import roundUpToDecimal from "../../../utils/roundUpToDecimal";

function AppendSonicLogo({ sonicLogoMeta, setIsSonicLogoModalOpen }) {
  const { uploadedVideoBlobURL } = useSelector((state) => state.video);
  const videoRef = useRef();
  const [isTrackLoading, setIsTrackLoading] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [sonicLogoStartPoint, setSonicLogoStartPoint] = useState(0);
  const {
    selectedAIMusicDetails,
    recentAIGeneratedData,
    SSflaxTrackID,
    sonicLogoId,
  } = useSelector((state) => state.AIMusic);
  const [playing, setplaying] = useState(false);
  const [curtime, setcurtime] = useState("00:00");
  const [duration, setduration] = useState("00:00");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const { projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const [regions, setRegions] = useState([]);
  const DEFAULT_SONIC_LOGO_DURATION_IN_SEC = 3;
  const regionsRef = useRef(regions);
  const wavesurferRef = useRef();
  const [parentCueDetails, setParentCueDetails] = useState({});

  const extendAudioWithSilence = async (
    buffer,
    originalDuration,
    targetDuration
  ) => {
    console.log("extendAudioWithSilence called");

    const audioCtx = new (window?.AudioContext || window?.webkitAudioContext)();
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

  useEffect(() => {
    if (!wavesurferRef.current?.isReady) return;

    const extendAudioIfNeeded = async () => {
      console.log("extendAudioIfNeeded called", wavesurferRef.current?.isReady);
      const originalDuration = roundUpToDecimal(
        wavesurferRef.current?.getDuration()
      );
      const targetDuration = roundUpToDecimal(projectDurationInsec);

      console.log("targetDuration", targetDuration);
      console.log("originalDuration", originalDuration);
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

    extendAudioIfNeeded();
  }, [projectDurationInsec, wavesurferRef.current?.isReady]);

  const loadAndSetupWaveSurfer = (mp3) => {
    wavesurferRef.current?.load(mp3);

    wavesurferRef.current?.on("ready", () => {
      setduration(formatTime(Math.round(wavesurferRef.current?.getDuration())));
      setIsTrackLoading(false);
    });
    wavesurferRef.current?.on("audioprocess", () => {
      setcurtime(formatTime(wavesurferRef.current?.getCurrentTime()));
    });

    wavesurferRef.current.on("loading", (e) => {
      setLoadingPercent(e);
    });

    wavesurferRef.current.on("seek", (e) => {
      const seekTimeInsec = e * wavesurferRef.current?.getDuration();
      setcurtime(formatTime(seekTimeInsec));
      videoRef.current?.seekTo(seekTimeInsec, "seconds");
    });

    if (window) {
      window.surferidze = wavesurferRef.current;
    }
  };

  // useEffect(() => {
  //   if (sonicLogoId) {
  //     let parentTrackCueId;
  //     const recentSonicLogoTrack = recentAIGeneratedData?.find(
  //       (track) => track?.action === AIMusicActions.SONIC_LOGO_APPEND
  //     );
  //     console.log("recentSonicLogoTrack", recentSonicLogoTrack);
  //     if (!!recentSonicLogoTrack) {
  //       parentTrackCueId = recentSonicLogoTrack?.parentCueId;
  //     } else {
  //       const recentSonicLogoParentTrack = recentAIGeneratedData?.find(
  //         (track) => track?.label?.includes("duration updated to")
  //       );
  //       console.log("recentSonicLogoParentTrack", recentSonicLogoParentTrack);
  //       parentTrackCueId = recentSonicLogoParentTrack?.value;
  //     }
  //     getTrackDetailsByCueID({
  //       cueID: parentTrackCueId,
  //       onSuccess: (res) => {
  //         setParentCueDetails(res?.data);
  //         loadAndSetupWaveSurfer(res?.data?.cue_audio_file_url);
  //       },
  //       onError: () => {
  //         console.log("error in getting track details");
  //         showNotification(
  //           "ERROR",
  //           "Error while loading track. Please try another combination.",
  //           5000
  //         );
  //       },
  //     });
  //   }
  // }, [sonicLogoId]);

  const plugins = [
    {
      key: "regions",
      plugin: RegionsPlugin,
      options: { dragSelection: false },
    },
  ];

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  const getRegenTaskID = (sonicLogoStartPoint, tuneyLogoId, logoTitle) => {
    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: null,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    setProcessStatus(true);

    const newAIMusicWithSonicLogoDurationInsec =
      sonicLogoStartPoint +
      (sonicLogoMeta?.duration || DEFAULT_SONIC_LOGO_DURATION_IN_SEC);

    console.log("sonicLogoStartPoint", sonicLogoStartPoint);

    // console.log("test", parentCueDetails, selectedAIMusicDetails);

    // const cueToProcess = !!sonicLogoId
    //   ? parentCueDetails
    //   : selectedAIMusicDetails;

    const cueToProcess = selectedAIMusicDetails;

    console.log(
      "divideDurationBySections***",
      cueToProcess?.sections?.length,
      newAIMusicWithSonicLogoDurationInsec,
      cueToProcess?.cue_parameters?.transition?.time,
      divideDurationBySections(
        cueToProcess?.sections?.length,
        newAIMusicWithSonicLogoDurationInsec,
        cueToProcess?.cue_parameters?.transition?.time
      )
    );

    let newModArr = divideDurationBySections(
      cueToProcess?.sections?.length,
      newAIMusicWithSonicLogoDurationInsec,
      cueToProcess?.cue_parameters?.transition?.time
    )?.map((sectionLength, index) => ({
      section: index + "",
      type: "length",
      value: sectionLength + "",
    }));

    let projectObj = {
      mods: [
        ...newModArr,
        { section: "all", type: "ending", value: "logo", param1: tuneyLogoId },
      ],
    };

    regenerateTrack({
      cueID: cueToProcess?.cue_id,
      config: projectObj,
      onSuccess: (response) => generateCueID(response.data.task_id, logoTitle),
      onError: () => setProcessStatus(false),
    });
  };

  const onGenerateCueSuccess = async (response, logoTitle) => {
    let trackTitle =
      selectedAIMusicDetails?.label?.split("##")?.[0] || response?.data?.name;
    let trackDescription = selectedAIMusicDetails.desc || "-";
    const action = `${logoTitle} sonic logo appended`;
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
        action: AIMusicActions.SONIC_LOGO_APPEND,
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
            action: AIMusicActions.SONIC_LOGO_APPEND,
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
          `${logoTitle} sonic logo appended succesfully!`
        );
        setIsSonicLogoModalOpen(false);
        navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
      },
    });
    setProcessStatus(false);
    setProcessPercent(0);
  };

  const generateCueID = (taskID, logoTitle) => {
    generateCue({
      taskID,
      onProgress: (response) => setProcessPercent(response.data.progress * 100),
      onSuccess: (res) => onGenerateCueSuccess(res, logoTitle),
      onError: () => {
        setProcessStatus(false);
        setProcessPercent(0);
      },
    });
  };

  useEffect(() => {
    // let AITrackLength = !!sonicLogoId
    //   ? parentCueDetails?.settings?.length
    //   : selectedAIMusicDetails?.settings?.length;

    let AITrackLength = selectedAIMusicDetails?.settings?.length;
    let sonicLogoStartPointDefault =
      AITrackLength -
      (sonicLogoMeta?.duration || DEFAULT_SONIC_LOGO_DURATION_IN_SEC);
    setSonicLogoStartPoint(sonicLogoStartPointDefault);
    console.log("AITrackLength", AITrackLength);
    setRegions([
      {
        id: `region-1`,
        start: sonicLogoStartPointDefault,
        end: AITrackLength,
        color: `var(--color-primary-shade3)`,
        drag: true,
        resize: false,
        data: {
          systemRegionId: 1,
        },
        formatTimeCallback: (start, end) => {
          return formatTime(start);
        },
      },
    ]);
    // }, [selectedAIMusicDetails?.cue_id, sonicLogoId, parentCueDetails?.cue_id]);
  }, [selectedAIMusicDetails?.cue_id]);

  const handleWSMount = useCallback(
    (waveSurfer) => {
      try {
        console.log(
          "selectedAIMusicDetails?.cue_audio_file_url",
          selectedAIMusicDetails?.cue_audio_file_url
        );
        // console.log(
        //   "parentCueDetails?.cue_audio_file_url",
        //   parentCueDetails?.cue_audio_file_url
        // );
        console.log("sonicLogoId", sonicLogoId);
        // console.log(
        //   "mp3 to load",
        //   !!sonicLogoId
        //     ? parentCueDetails?.cue_audio_file_url
        //     : selectedAIMusicDetails?.cue_audio_file_url
        // );
        console.log("mp3 to load", selectedAIMusicDetails?.cue_audio_file_url);

        // const mp3ToLoad = !!sonicLogoId
        //   ? parentCueDetails?.cue_audio_file_url
        //   : selectedAIMusicDetails?.cue_audio_file_url;

        const mp3ToLoad = selectedAIMusicDetails?.cue_audio_file_url;

        // if (!mp3ToLoad) return;

        wavesurferRef.current = waveSurfer;

        if (wavesurferRef.current && !!mp3ToLoad) {
          loadAndSetupWaveSurfer(mp3ToLoad);
        }
      } catch (error) {
        console.log("error", error);
      }
    },
    // [
    //   selectedAIMusicDetails?.cue_audio_file_url,
    //   sonicLogoId,
    //   parentCueDetails?.cue_audio_file_url,
    // ]
    [selectedAIMusicDetails?.cue_audio_file_url]
  );

  const play = useCallback(() => {
    setplaying(!wavesurferRef.current?.isPlaying());
    wavesurferRef.current.playPause();
  }, []);

  const handleRegionUpdateEnd = useCallback((region) => {
    setSonicLogoStartPoint(region?.start);
  }, []);

  const START_TIME_BLOCK_WIDTH = 50;

  const handleThrottleRegionOnUpdate = useCallback(
    throttle((region, projectDurationInsec) => {
      if (
        region?.start / projectDurationInsec > 0.5 &&
        region?.element?.clientWidth < START_TIME_BLOCK_WIDTH
      ) {
        region.element.className = `wavesurfer-region close-to-end`;
      } else {
        region.element.className = `wavesurfer-region close-to-start`;
      }
    }, 250),
    []
  );

  const handleRegionOnUpdate = useCallback((region) => {
    handleThrottleRegionOnUpdate(region, projectDurationInsec);
  }, []);

  let { theme } = useConfig();

  const zoomWave = (action) => {
    setZoomPercent((prev) => {
      let newZoomPercent;
      if (action === "ZOOM_IN") {
        newZoomPercent = prev === 100 ? prev : prev + 10;
      } else {
        newZoomPercent = prev === 0 ? prev : prev - 10;
      }
      wavesurferRef.current?.zoom(newZoomPercent);
      return newZoomPercent;
    });
  };

  return (
    <>
      {processStatus && <CustomLoader processPercent={processPercent} />}
      <div className="AppendSonicLogo_container">
        <div className="AppendSonicLogo_header">
          <h3 className="boldFamily header">Sonic Logo</h3>
          <p>Move the Sonic Logo to set it and then apply changes</p>
        </div>
        {uploadedVideoBlobURL && (
          <ReactPlayer
            style={{
              backgroundColor: "var(--color-secondary)",
              borderRadius: "10px",
              overflow: "hidden",
              margin: "15px 0",
            }}
            ref={videoRef}
            width="100%"
            height="350px"
            muted={true}
            url={uploadedVideoBlobURL}
            playing={playing}
            // onError={onVideoError}
            // onReady={onVideoReady}
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
        )}
        <div className="AppendSonicLogo_subheader">
          <div className="AppendSonicLogo_timestamp">
            {isTrackLoading ? (
              "--:-- / --:--"
            ) : (
              <>
                <span className="AppendSonicLogo_curr-time">{curtime}</span>
                &nbsp;{"/"}&nbsp;
                <span className="AppendSonicLogo_duration">{duration}</span>
              </>
            )}
          </div>
          <div className="AppendSonicLogo_zoom_icon_container">
            <button
              disabled={zoomPercent === 100 || isTrackLoading}
              onClick={() => {
                zoomWave("ZOOM_IN");
              }}
            >
              <TfiZoomIn
                className={`AppendSonicLogo_zoom_icons AppendSonicLogo_zoom_icon_disabled`}
              />
            </button>
            <button
              disabled={zoomPercent === 0 || isTrackLoading}
              onClick={() => {
                zoomWave("ZOOM_OUT");
              }}
            >
              <TfiZoomOut className="AppendSonicLogo_zoom_icons" />
            </button>
          </div>
        </div>
        <div className="AppendSonicLogo_main_container">
          <div
            className="AppendSonicLogo_play_pause_btn"
            style={{
              cursor: isTrackLoading ? "progress" : "pointer",
            }}
          >
            <button
              className="AppendSonicLogo_play_pause_cue_icon"
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
            className="AppendSonicLogo_wave"
            style={{
              position: "relative",
            }}
          >
            <div
              className="AppendSonicLogo_cue_variant_spinner_container"
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
            <div
              style={{
                height: "60px",
                overflow: "hidden",
              }}
            >
              <WaveSurfer
                id={`waveSurfer_sonic_logo_append_${selectedAIMusicDetails?.cue_id}`}
                onMount={handleWSMount}
                plugins={plugins}
              >
                <WaveForm
                  container={`#waveSurfer_sonic_logo_append_${selectedAIMusicDetails?.cue_id}`}
                  barWidth={1}
                  barRadius={1}
                  cursorColor={theme?.["--color-primary"]}
                  cursorWidth={1}
                  barGap={5}
                  barMinHeight={2}
                  progressColor={theme?.["--color-wave-progress"]}
                  waveColor={theme?.["--color-wave-bg"]}
                  width={"100%"}
                  height={60}
                  // hideScrollbar
                  responsive
                  id={`waveSurfer_sonic_logo_append_${selectedAIMusicDetails?.cue_id}`}
                >
                  {!isTrackLoading &&
                    regions.map((regionProps) => (
                      <Region
                        onUpdateEnd={handleRegionUpdateEnd}
                        onUpdate={handleRegionOnUpdate}
                        id={regionProps.id}
                        // onOver={(e) => console.log("e", e)}
                        // onUpdate={(e) => {
                        // let parent =
                        //   document.getElementsByClassName(
                        //     "wavesurfer-region"
                        //   )?.[0];
                        // console.log("parent", parent);
                        // parent.innerHTML = `<span>${e?.start}</span>`;
                        // }}
                        key={regionProps.id}
                        {...regionProps}
                      />
                    ))}
                </WaveForm>
              </WaveSurfer>
            </div>
          </div>
        </div>

        <div className="AppendSonicLogo_btn_container">
          <ButtonWrapper onClick={() => setIsSonicLogoModalOpen(false)}>
            Cancel
          </ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            onClick={() =>
              getRegenTaskID(
                sonicLogoStartPoint,
                sonicLogoMeta?.tuneyLogoId,
                sonicLogoMeta?.title
              )
            }
          >
            Apply changes
          </ButtonWrapper>
        </div>
      </div>
    </>
  );
}

export default AppendSonicLogo;
