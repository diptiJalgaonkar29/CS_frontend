import "./Timeline.css";
import { ReactComponent as HideIcon } from "../../../../static/Timeline/hide-timeline.svg";
import { ReactComponent as ShowIcon } from "../../../../static/Timeline/show-timeline.svg";
import DummySoundwave from "../../../../static/Timeline/dummy-soundwave.svg";
import { ReactComponent as TimelineMarker } from "../../../../static/Timeline/timelineMarker.svg";
import { useSelector, useDispatch } from "react-redux";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import React, { useRef, useState, useCallback, useEffect } from "react";
import TimelineVoiceSlider from "../TimelineVoiceSlider/TimelineVoiceSlider";
import { useConfig } from "../../../../customHooks/useConfig";
import TimelineVoiceScale from "../TimelineVoiceScale/TimelineVoiceScale";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import useAudioPlayerSimulator from "../../../../customHooks/useAudioPlayerSimulator";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import formatTime from "../../../../utils/formatTime";
import getAudioPathFromVideo from "../../services/videoDB/getAudioPathFromVideo";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import SliderInputWrapper from "../../../../branding/componentWrapper/SliderInputWrapper";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import useDidMount from "../../../../customHooks/useDidMount";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { debounce, round } from "lodash";
// import ThumbnailList from "./ThumbnailList";
import AudioTimeline from "./AudioTimeline";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { useParams } from "react-router-dom";
import IconButtonWrapper from "../../../../branding/componentWrapper/IconButtonWrapper";

export default function Timeline() {
  const {
    selectedAIMusicDetails,
    playedCueID,
    playedInstrument,
    playedSonicLogo,
    sonicLogoId,
  } = useSelector((state) => state.AIMusic);
  // const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);
  let { cue_id } = useParams();
  const { stabilityMP3TracksArr, currentUseThisTrack } = useSelector((state) => state.AIMusicStability);
  const { brandMeta } = getCSUserMeta();
  const [collapse, setcollapse] = useState(false);
  const [imageLoadingError, setImageLoadingError] = useState(true);
  const [audioObjectUrl, setAudioObjectUrl] = useState(null);
  const {
    thumbnails,
    uploadedVideoURL,
    tXId,
    tXStatus,
    tXsplit,
    tXfilePath,
    tXfilePathBlob,
  } = useSelector((state) => state.video);
  const { TTSTimelineVoicesMP3, isTTSProcessing, isTTSVoicePlaying } =
    useSelector((state) => state.voices);
  const {
    projectDurationInsec,
    projectID,
    timelineSeekTime,
    timelineVoiceVolume,
    timelineMusicVolume,
    isVideoPlaying,
    isTimelinePlaying,
  } = useSelector((state) => state.projectMeta);
  const [playingAudioMeta, setplayingAudioMeta] = useState({});
  const wavesurferRef = useRef();
  const [waveSurferLoadingPercent, setWaveSurferLoadingPercent] = useState(0);
  const [
    wavesurferVideosAudioLoadingPercent,
    setWavesurferVideosAudioLoadingPercent,
  ] = useState(0);
  const wavesurferVideosAudioRef = useRef();
  const dispatch = useDispatch();
  let { theme, jsonConfig } = useConfig();
  let trackGeneratedForTimeline;
  const {
    state: audioPlayerSimulatorState,
    dispatch: audioPlayerSimulatorDispatch,
  } = useAudioPlayerSimulator();
  const markerRef = useRef();
  const VOLUME_SAVE_DEBOUNCE_TIME = 800;
  const TIMELINE_MARKER_SVG_OFFSET = "12px";

  const [isTimelineReady, setIsTimelineReady] = useState({
    voice: true,
    music: true,
    video: !uploadedVideoURL,
  });

  const resetTimeline = () => {
    dispatch(
      SET_PROJECT_META({
        isVideoPlaying: false,
        timelineSeekTime: 0,
        isTimelinePlaying: false,
      })
    );
  };

  useEffect(() => {
    resetTimeline();
    return () => {
      resetTimeline();
    };
  }, []);

  useEffect(() => {
    if (isTimelinePlaying) {
      playAllTimeline();
    } else {
      pauseAllTimeline();
    }
  }, [isTimelinePlaying]);

  const setMarkerPosition = (currentTime, projectDurationInsec) => {
    if (!markerRef.current) return;
    let fraction = round(currentTime, 1) / round(projectDurationInsec, 1);
    // let fraction = round(currentTime, 1) / round(projectDurationInsec, 1);
    markerRef.current.style.left = `calc(${fraction * 100
      }% - ${TIMELINE_MARKER_SVG_OFFSET})`;
  };

  const playVoiceOnStartTime = (
    currentTime,
    isTimelinePlaying,
    TTSTimelineVoicesMP3
  ) => {
    if (!isTimelinePlaying || TTSTimelineVoicesMP3.length === 0) return;
    let mp3 = TTSTimelineVoicesMP3?.find((data) => {
      let mp3StartPoint = +data.startPoint;
      let mp3EndPoint = +data?.startPoint + +data?.duration;
      return mp3StartPoint < currentTime && currentTime < mp3EndPoint;
    });
    if (
      mp3?.mp3 &&
      document.getElementById(
        `audio-player-${mp3?.startPoint}-${mp3?.duration}`
      )?.paused
    ) {
      const selectedAudioElement = document.getElementById(
        `audio-player-${mp3?.startPoint}-${mp3?.duration}`
      );
      // console.log("playing###", selectedAudioElement.currentTime);
      setplayingAudioMeta(mp3);
      selectedAudioElement.currentTime = roundUpToDecimal(
        +currentTime - +mp3?.startPoint
      );
      selectedAudioElement?.play();
    }

    if (!mp3?.mp3) {
      setplayingAudioMeta({});
    }
  };

  useEffect(() => {
    // if (!!wavesurferRef?.current || !!wavesurferVideosAudioRef?.current) return;

    let timerCurrentTime = +audioPlayerSimulatorState?.time;
    setMarkerPosition(timerCurrentTime, projectDurationInsec);
    playVoiceOnStartTime(
      timerCurrentTime,
      audioPlayerSimulatorState?.isRunning,
      TTSTimelineVoicesMP3
    );

    let isFinishedPlaying = timerCurrentTime > projectDurationInsec;
    if (isFinishedPlaying) {
      onAudioPlayerSimulatorEnd();
    }
  }, [
    audioPlayerSimulatorState?.time,
    audioPlayerSimulatorState?.isRunning,
    TTSTimelineVoicesMP3?.length,
  ]);

  const onAudioPlayerSimulatorEnd = () => {
    audioPlayerSimulatorDispatch({ type: "stop" });
    dispatch(
      SET_PROJECT_META({
        isVideoPlaying: false,
        timelineSeekTime: 0,
      })
    );
    let selectedAudioElement = document.getElementById(
      `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
    );

    if (selectedAudioElement) {
      selectedAudioElement?.pause();
      selectedAudioElement.currentTime = +playingAudioMeta?.duration - 0.1;
    }
    setMarkerPosition(0, projectDurationInsec);
    let videoElement = document.querySelector("#project_video_v2 video");
    if (videoElement) {
      videoElement?.pause();
      videoElement.currentTime = 0;
    }
  };

  useEffect(() => {
    // console.log("currentUseThisTrack", currentUseThisTrack)
    // console.log("cue_id", cue_id)
    if (!currentUseThisTrack || !cue_id || brandMeta?.aiMusicProvider !== "stability") return;
    let objectToSendInApi = currentUseThisTrack?.length > 0 ? currentUseThisTrack : cue_id

    console.log("objectToSendInApi", objectToSendInApi)
    const generateBlob = async () => {
      try {
        const { data } = await axiosCSPrivateInstance.get(
          `stability/getByUserData/${objectToSendInApi}`
        );
        console.log("data____", data)
        const fileName = data.fileName;
        console.log("fileName", fileName);

        const res = await axiosCSPrivateInstance.get(
          `/stability/GetMediaFile/${projectID}/${fileName}`,
          { responseType: "blob" }
        );

        const objectURL = URL.createObjectURL(res.data);

        setAudioObjectUrl(objectURL);
        console.log("Fetched Stability MP3 file:", objectURL);

        // setBlobKey(objectURL);
      } catch (err) {
        console.error("Failed to generate blob URL:", err);
      }
    };

    generateBlob();
  }, [currentUseThisTrack, cue_id]);

  useEffect(() => {
    if (!playingAudioMeta?.mp3) {
      document.querySelectorAll(".voice-audio")?.forEach((e) => {
        !e?.paused && e?.pause();
      });
    }
  }, [playingAudioMeta?.mp3]);

  useEffect(() => {
    if ([undefined, null].includes(timelineSeekTime)) {
      return;
    }
    try {
      if (document.querySelectorAll(".voice-audio").length !== 0) {
        document.querySelectorAll(".voice-audio")?.forEach((element) => {
          let duration =
            element.id.split("-")?.[element.id.split("-").length - 1];
          element?.pause();
          element.currentTime = duration - 0.1;
        });
      }
      let fraction =
        round(timelineSeekTime, 1) / round(projectDurationInsec, 1);
      if (isNaN(fraction)) return;
      wavesurferRef.current?.seekTo(fraction);
      wavesurferVideosAudioRef.current?.seekTo(fraction);
      markerRef.current.style.left = `calc(${fraction * 100
        }% - ${TIMELINE_MARKER_SVG_OFFSET})`;
      audioPlayerSimulatorDispatch({
        type: "seek",
        payload: +timelineSeekTime,
      });
    } catch (error) {
      console.log("error", error);
      wavesurferRef.current?.seekTo(0);
      wavesurferVideosAudioRef.current?.seekTo(0);
    }
  }, [timelineSeekTime, audioPlayerSimulatorState?.isRunning]);

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

    extendAudioIfNeeded();
  }, [projectDurationInsec, wavesurferRef.current?.isReady]);

  const lastRunRef = useRef(0);

  useEffect(() => {
    if (
      (!wavesurferRef.current?.isReady &&
        !wavesurferVideosAudioRef.current?.isReady) ||
      timelineVoiceVolume === 0 ||
      timelineMusicVolume === 0
    )
      return;

    const throttleGap =
      window.globalConfig?.OUTPUT_BG_FADE_DURATION_IN_SEC * 100;
    const fadeDuration = window.globalConfig?.OUTPUT_BG_FADE_DURATION_IN_SEC;
    const fadeGapDuration =
      window.globalConfig?.OUTPUT_BG_FADE_DURATION_IN_SEC * 2 || 4;

    const minVolume = Math.max(
      timelineMusicVolume -
      window.globalConfig?.OUTPUT_FADE_NO_OF_STEPS *
      window.globalConfig?.FADE_VOLUME_INCREMENT_DECREMENT,
      window.globalConfig?.FADE_VOLUME_INCREMENT_DECREMENT
    );

    const handler = (e) => {
      const now = performance.now();
      if (now - lastRunRef.current < throttleGap) return;
      lastRunRef.current = now;

      const currentTime = e;

      const mp3s = [...(TTSTimelineVoicesMP3 || [])]
        .map((mp3) => ({
          ...mp3,
          start: +mp3.startPoint,
          end: +mp3.startPoint + +mp3.duration,
        }))
        .sort((a, b) => a.start - b.start);

      let volume = timelineMusicVolume;

      for (let i = 0; i < mp3s.length; i++) {
        const curr = mp3s[i];
        const next = mp3s[i + 1];

        const inMain = currentTime >= curr.start && currentTime <= curr.end;
        const inFadeIn =
          currentTime >= curr.start - fadeDuration && currentTime < curr.start;
        const inFadeOut =
          currentTime > curr.end && currentTime <= curr.end + fadeDuration;

        const isNextClose = next && next.start - curr.end < fadeGapDuration;

        // 🎯 If currently in voice OR bridging to next closely, keep minVolume
        if (
          inMain ||
          (isNextClose && currentTime > curr.end && currentTime < next.start)
        ) {
          volume = minVolume;
          break;
        }

        // 🎯 Fade In only if no previous short bridge
        if (
          inFadeIn &&
          (!i || curr.start - mp3s[i - 1].end >= fadeGapDuration)
        ) {
          const progress =
            (currentTime - (curr.start - fadeDuration)) / fadeDuration;
          volume =
            timelineMusicVolume - (timelineMusicVolume - minVolume) * progress;
          break;
        }

        // 🎯 Fade Out only if next is not close
        if (inFadeOut && (!next || next.start - curr.end >= fadeGapDuration)) {
          const progress = (currentTime - curr.end) / fadeDuration;
          volume = minVolume + (timelineMusicVolume - minVolume) * progress;
          break;
        }
      }

      wavesurferRef.current?.setVolume(volume);
      wavesurferVideosAudioRef.current?.setVolume(volume);
      // console.log(
      //   `Volume at ${currentTime.toFixed(2)}s → ${volume.toFixed(3)}`
      // );
    };

    wavesurferRef.current?.on("audioprocess", handler);
    wavesurferVideosAudioRef.current?.on("audioprocess", handler);

    return () => {
      wavesurferRef.current?.un("audioprocess", handler);
      wavesurferVideosAudioRef.current?.un("audioprocess", handler);
      lastRunRef.current = 0;
    };
  }, [
    wavesurferRef.current?.isReady,
    wavesurferVideosAudioRef.current?.isReady,
    TTSTimelineVoicesMP3,
    timelineMusicVolume,
    timelineVoiceVolume,
  ]);

  // If audioSrc changes, reload the audio
  useEffect(() => {
    if (wavesurferRef.current && audioObjectUrl) {
      wavesurferRef.current.load(audioObjectUrl);
    }
  }, [audioObjectUrl]);

  const handleWSMount = useCallback(
    (waveSurfer) => {
      // if (!selectedAIMusicDetails?.cue_audio_file_url) return;
      setIsTimelineReady((prev) => ({ ...prev, music: false }));
      wavesurferRef.current = waveSurfer;
      if (wavesurferRef.current) {
        wavesurferRef.current.load(selectedAIMusicDetails?.cue_audio_file_url);
        wavesurferRef.current.on("ready", () => {
          resetTimeline();
          setIsTimelineReady((prev) => ({ ...prev, music: true }));
        });
        wavesurferRef.current?.on("loading", (e) => {
          setWaveSurferLoadingPercent(e);
        });
        wavesurferRef.current.on("finish", () => {
          wavesurferRef.current?.stop();
          wavesurferRef.current?.seekTo(0);
          wavesurferVideosAudioRef.current?.stop();
          wavesurferVideosAudioRef.current?.seekTo(0);
          onAudioPlayerSimulatorEnd();
        });
      }
    },
    [selectedAIMusicDetails?.cue_audio_file_url, projectDurationInsec]
  );

  const handleWSMountStability = useCallback(
    (waveSurfer) => {
      if (!currentUseThisTrack) return;
      setIsTimelineReady((prev) => ({ ...prev, music: false }));
      wavesurferRef.current = waveSurfer;
      if (wavesurferRef.current) {
        wavesurferRef.current.load(currentUseThisTrack);
        wavesurferRef.current.on("ready", () => {
          resetTimeline();
          setIsTimelineReady((prev) => ({ ...prev, music: true }));
        });
        wavesurferRef.current?.on("loading", (e) => {
          setWaveSurferLoadingPercent(e);
        });
        wavesurferRef.current.on("finish", () => {
          wavesurferRef.current?.stop();
          wavesurferRef.current?.seekTo(0);
          wavesurferVideosAudioRef.current?.stop();
          wavesurferVideosAudioRef.current?.seekTo(0);
          onAudioPlayerSimulatorEnd();
        });
      }
    },
    [selectedAIMusicDetails?.cue_audio_file_url, projectDurationInsec]
  );

  const handleWSMountAudioInVideo = useCallback(
    async (waveSurfer) => {
      if (!tXfilePath) return;
      setIsTimelineReady((prev) => ({
        ...prev,
        ...(tXsplit === "0" ? { voice: false } : { music: false }),
      }));
      let failedCount = 0;
      wavesurferVideosAudioRef.current = waveSurfer;
      if (wavesurferVideosAudioRef.current) {
        if (tXfilePathBlob) {
          wavesurferVideosAudioRef.current.load(tXfilePathBlob);
        } else {
          let response = await axiosCSPrivateInstance(
            `/video/split_voice_or_instrumental_mp3/${tXfilePath}`,
            {
              responseType: "blob",
            }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          dispatch(SET_VIDEO_META({ tXfilePathBlob: url }));
          wavesurferVideosAudioRef.current.load(url);
        }
        wavesurferVideosAudioRef.current.on("ready", () => {
          // wavesurferVideosAudioRef.current.setVolume(0.4);
          resetTimeline();
          setIsTimelineReady((prev) => ({
            ...prev,
            ...(tXsplit === "0" ? { voice: true } : { music: true }),
          }));
        });
        wavesurferVideosAudioRef.current.on("error", async (e) => {
          if (failedCount >= 3) return;
          failedCount++;
          console.log("ERROR WHILE IN BLOB URL", failedCount);
          let response = await axiosCSPrivateInstance(
            `/video/split_voice_or_instrumental_mp3/${tXfilePath}`,
            {
              responseType: "blob",
            }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          dispatch(SET_VIDEO_META({ tXfilePathBlob: url }));
          wavesurferVideosAudioRef.current.load(url);
        });
        wavesurferVideosAudioRef.current.on("play", () => {
          dispatch(SET_PROJECT_META({ isTimelinePlaying: true }));
        });
        wavesurferVideosAudioRef.current?.on("loading", (e) => {
          setWavesurferVideosAudioLoadingPercent(e);
        });
        wavesurferVideosAudioRef.current.on("pause", () => {
          dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
        });
        wavesurferVideosAudioRef.current.on("finish", () => {
          wavesurferRef.current?.stop();
          wavesurferRef.current?.seekTo(0);
          wavesurferVideosAudioRef.current?.stop();
          wavesurferVideosAudioRef.current?.seekTo(0);
          onAudioPlayerSimulatorEnd();
        });
        if (window) {
          window.surferidze = wavesurferVideosAudioRef.current;
        }
      }
    },
    [tXfilePath]
  );

  const playPauseWave = useCallback(
    (action) => {
      if (
        (playedCueID !== null ||
          playedInstrument !== null ||
          playedSonicLogo !== null) &&
        action === "PLAY"
      ) {
        dispatch(
          SET_AI_MUSIC_META({
            playedCueID: null,
            playedInstrument: null,
            playedSonicLogo: null,
          })
        );
      }
      if (action === "PLAY") {
        wavesurferRef.current?.play();
        wavesurferVideosAudioRef.current?.play();
      } else {
        wavesurferRef.current?.pause();
        wavesurferVideosAudioRef.current?.pause();
      }

      dispatch(
        SET_PROJECT_META({
          isVideoPlaying: audioPlayerSimulatorState?.isRunning,
          timelineSeekTime: audioPlayerSimulatorState?.time,
        })
      );
    },
    [
      selectedAIMusicDetails?.cue_id,
      audioPlayerSimulatorState?.isRunning,
      tXfilePath,
      playedCueID,
      playedInstrument,
      playedSonicLogo,
    ]
  );

  const pauseTimeline = () => {
    // if (selectedAIMusicDetails?.cue_id) {
    wavesurferRef.current?.pause();
    wavesurferVideosAudioRef.current?.pause();
    // } else {
    audioPlayerSimulatorDispatch({ type: "pause" });
    // }
    dispatch(
      SET_PROJECT_META({
        isVideoPlaying: false,
      })
    );
    const selectedAudioElement = document.getElementById(
      `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
    );

    selectedAudioElement?.pause();
  };

  useEffect(() => {
    if (
      playedCueID ||
      playedInstrument ||
      playedSonicLogo ||
      isTTSProcessing ||
      isTTSVoicePlaying
    ) {
      pauseTimeline();
    }
  }, [
    playedCueID,
    playedInstrument,
    playedSonicLogo,
    isTTSProcessing,
    isTTSVoicePlaying,
  ]);

  useEffect(() => {
    const selectedAudioElement = document.getElementById(
      `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
    );
    if (isVideoPlaying) {
      // if (selectedAIMusicDetails?.cue_id || wavesurferVideosAudioRef.current) {
      wavesurferRef.current?.play();
      wavesurferVideosAudioRef.current?.play();
      // } else {
      audioPlayerSimulatorDispatch({ type: "play" });
      // }
      selectedAudioElement?.play();
    } else {
      // if (selectedAIMusicDetails?.cue_id || wavesurferVideosAudioRef.current) {
      wavesurferRef.current?.pause();
      wavesurferVideosAudioRef.current?.pause();
      // } else {
      audioPlayerSimulatorDispatch({ type: "pause" });
      // }
      selectedAudioElement?.pause();
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    if (!!tXfilePath)
      return console.log("No Looping...!!tXfilePath", !!tXfilePath);
    if (!tXId) return console.log("No Looping...!tXId", !tXId);
    if (tXStatus === "completed" || !tXStatus)
      return console.log(
        "No Looping...tXStatus === completed || !tXStatus",
        tXStatus === "completed" || !tXStatus
      );
    let intevalId;
    intevalId = setInterval(() => {
      getAudioPathFromVideo({ taxonomyId: tXId }).then((res) => {
        if (res?.status === "completed" && res?.fileName) {
          dispatch(
            SET_VIDEO_META({
              tXStatus: res?.status,
              tXfilePath: res?.fileName,
            })
          );
          showNotification(
            "SUCCESS",
            `The ${+tXsplit === 0 ? "voice" : "music"
            } from your video has been processed`,
            4000
          );
          clearInterval(intevalId);
        }
      });
    }, jsonConfig?.FETCH_AUDIO_FROM_VIDEO_INTERVAL || 10000);

    return () => {
      clearInterval(intevalId);
    };
  }, [tXStatus, tXfilePath]);

  useEffect(() => {
    dispatch(
      SET_PROJECT_META({
        isTimelinePlaying: audioPlayerSimulatorState?.isRunning,
      })
    );
  }, [audioPlayerSimulatorState?.isRunning]);

  const pauseOtherPlayingVoices = () => {
    const TTSPlayerAudioElement = document.getElementById("TTS_player_audio");
    if (TTSPlayerAudioElement && !TTSPlayerAudioElement?.paused) {
      TTSPlayerAudioElement?.pause();
      TTSPlayerAudioElement.currentTime = 0;
    }
  };

  const playAllTimeline = () => {
    pauseOtherPlayingVoices();
    const selectedAudioElement = document.getElementById(
      `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
    );
    // if (
    //   selectedAIMusicDetails?.cue_id ||
    //   (wavesurferVideosAudioRef?.current && tXfilePath)
    // ) {
    playPauseWave("PLAY");
    //   let waveCurrentTime =
    //     roundUpToDecimal(wavesurferRef.current?.getCurrentTime()) ||
    //     roundUpToDecimal(+wavesurferVideosAudioRef.current?.getCurrentTime());
    //   if (selectedAudioElement) {
    //     selectedAudioElement.currentTime = roundUpToDecimal(
    //       waveCurrentTime - +playingAudioMeta?.startPoint
    //     );
    //   }
    // } else {
    audioPlayerSimulatorDispatch({ type: "play" });
    dispatch(
      SET_PROJECT_META({
        isVideoPlaying: true,
        timelineSeekTime: audioPlayerSimulatorState?.time,
      })
    );
    if (selectedAudioElement) {
      selectedAudioElement.currentTime = roundUpToDecimal(
        +audioPlayerSimulatorState?.time - +playingAudioMeta?.startPoint
      );
    }
    // }
    selectedAudioElement?.play();
  };

  // console.log("audioPlayerSimulatorState", audioPlayerSimulatorState);

  const pauseAllTimeline = () => {
    // if (
    //   selectedAIMusicDetails?.cue_id ||
    //   (wavesurferVideosAudioRef?.current && tXfilePath)
    // ) {
    playPauseWave("PAUSE");
    // } else {
    audioPlayerSimulatorDispatch({ type: "pause" });
    dispatch(
      SET_PROJECT_META({
        isVideoPlaying: false,
        timelineSeekTime: audioPlayerSimulatorState?.time,
      })
    );
    // }
    document
      .getElementById(
        `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
      )
      ?.pause();
  };

  useEffect(() => {
    try {
      const selectedAudioElement = document.getElementById(
        `audio-player-${playingAudioMeta?.startPoint}-${playingAudioMeta?.duration}`
      );
      if (selectedAudioElement) {
        selectedAudioElement.volume = timelineVoiceVolume;
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [timelineVoiceVolume, JSON.stringify(playingAudioMeta)]);

  useEffect(() => {
    try {
      // handle AI Music volume and mute
      wavesurferRef.current?.setVolume(timelineMusicVolume);

      //handle Audio from Video volume and mute
      if (["0", "1"].includes(tXsplit)) {
        wavesurferVideosAudioRef.current?.setVolume(
          tXsplit === "0" ? timelineVoiceVolume : timelineMusicVolume
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [
    timelineVoiceVolume,
    timelineMusicVolume,
    wavesurferRef.current?.isReady,
    wavesurferVideosAudioRef.current?.isReady,
  ]);

  const debouncedVolume = useCallback(
    debounce((volumeMeta) => {
      updateProjectMeta({
        projectID,
        projectMeta: volumeMeta,
      });
    }, VOLUME_SAVE_DEBOUNCE_TIME),
    []
  );

  const didMount = useDidMount();

  useEffect(() => {
    if (!didMount) return;
    debouncedVolume({
      voiceLayerVolume: +timelineVoiceVolume,
      musicLayerVolume: +timelineMusicVolume,
    });
  }, [timelineVoiceVolume, timelineMusicVolume]);

  useEffect(() => {
    if (!collapse) {
      try {
        wavesurferRef.current.drawBuffer();
      } catch (error) {
        // console.log("error", error);
      }
      try {
        wavesurferVideosAudioRef.current.drawBuffer();
      } catch (error) {
        // console.log("error", error);
      }
    }
  }, [collapse]);

  return (
    <div className="timeline_container">
      <AudioTimeline
        TTSTimelineVoicesMP3={TTSTimelineVoicesMP3}
        setIsTimelineReady={setIsTimelineReady}
      />
      <div
        className={`${collapse ? "timeline-box-collapsed" : "timeline-box"}`}
      >
        <div
          className={`toggle_btn_container`}
          id="toggle_btn_container"
          onClick={() => {
            setcollapse((prev) => !prev);
          }}
        >
          <p className="toggle_btn_text">
            {collapse ? "Expand Timeline" : "Hide Timeline"}
            {collapse ? <ShowIcon /> : <HideIcon />}
          </p>
        </div>
        <div className="timeline_box_container">
          <div className="left">
            <div className="header boldFamily">
              {
                //   selectedAIMusicDetails?.cue_id ||
                // wavesurferVideosAudioRef.current
                //   ? formatTime(currentTime)
                //     :
                formatTime(audioPlayerSimulatorState?.time)
              }
              &nbsp;/&nbsp;{formatTime(Math.round(projectDurationInsec))}
            </div>
            {!isTimelinePlaying ? (
              <div className={`play_pause_btn_container`}>
                <button
                  className="play_btn"
                  disabled={
                    !isTimelineReady?.video ||
                    !isTimelineReady?.music ||
                    !isTimelineReady?.voice
                  }
                  onClick={() =>
                    dispatch(SET_PROJECT_META({ isTimelinePlaying: true }))
                  }
                >
                  <IconButtonWrapper icon="BorderedPlay" className="pause_btn" />
                </button>
              </div>
            ) : (
              <div className={`play_pause_btn_container`}>
                <button
                  className="play_btn"
                  disabled={
                    !isTimelineReady?.video ||
                    !isTimelineReady?.music ||
                    !isTimelineReady?.voice
                  }
                  onClick={() =>
                    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }))
                  }
                >
                  <IconButtonWrapper icon="BorderedPause" className="pause_btn" />
                </button>
              </div>
            )}
          </div>
          <div className="right">
            <div className="header">
              <TimelineVoiceScale
                isCollapsed={collapse}
                thumbValue={
                  // selectedAIMusicDetails?.cue_id ||
                  // wavesurferVideosAudioRef.current
                  //   ? currentTime
                  //   :
                  +audioPlayerSimulatorState?.time
                }
              />
            </div>
            <div className="marker_container">
              <TimelineMarker id="marker" ref={markerRef} />
            </div>
            <div style={{ display: collapse ? "none" : "block" }}>
              {TTSTimelineVoicesMP3?.length !== 0 && (
                <div className="timeline_voice_silder_container">
                  <TimelineVoiceSlider />
                  <div className="timeline_asset_icon">
                    <IconWrapper icon="Voice" />
                  </div>
                  <div className="timeline_voice_volume_slider_wrapper">
                    <div className={`timeline_voice_volume_slider_container`}>
                      <div className="slider_container">
                        <SliderInputWrapper
                          min={0}
                          max={1}
                          step={0.1}
                          value={timelineVoiceVolume}
                          onChange={(vol) => {
                            dispatch(
                              SET_PROJECT_META({ timelineVoiceVolume: +vol })
                            );
                          }}
                        />
                      </div>
                    </div>
                    <IconWrapper
                      className={`timeline_voice_volume_speaker_icon`}
                      icon={
                        +timelineVoiceVolume === 0 ? "SpeakerMute" : "Speaker"
                      }
                      onClick={() => {
                        // setIsVoiceLayerMuted(!isVoiceLayerMuted);
                        dispatch(
                          SET_PROJECT_META({
                            timelineVoiceVolume:
                              // +timelineVoiceVolume !== 0 ? 0 : 0.6,
                              +timelineVoiceVolume !== 0 ? 0 : 1,
                          })
                        );
                      }}
                    />
                  </div>
                </div>
              )}
              {!!tXStatus &&
                !tXfilePath &&
                !!tXsplit &&
                ["0", "1"].includes(tXsplit) &&
                tXStatus !== "completed" && (
                  <>
                    <div className="timeline_dummy_wave_container">
                      <img src={DummySoundwave} alt="sound-wave" />
                      <p className="bg_process_hint">
                        The {+tXsplit === 0 ? "voice" : "music"} from your video
                        is processing...
                      </p>
                      <div className="timeline_asset_icon">
                        {tXsplit === "0" ? (
                          <IconWrapper icon="Voice" />
                        ) : (
                          <IconWrapper icon="Music" />
                        )}
                      </div>
                    </div>
                  </>
                )}
              {tXfilePath && !!tXsplit && tXStatus === "completed" && (
                <div className="timeline_AI_music_container">
                  <div className="waveform-timeline" id="waveform">
                    <WaveSurfer onMount={handleWSMountAudioInVideo}>
                      <WaveForm
                        barWidth={1} //1
                        barRadius={1} //1
                        hideScrollbar
                        barGap={2} //5
                        barMinHeight={1} //2
                        cursorWidth={0}
                        progressColor={theme?.["--color-wave-progress"]}
                        waveColor={theme?.["--color-wave-bg"]}
                        container={document.querySelector("#waveform")}
                        height={30} //100
                        responsive
                        hideCursor={true}
                        id={`waveform-timeline-audio`}
                      ></WaveForm>
                    </WaveSurfer>
                  </div>
                  {wavesurferVideosAudioLoadingPercent !== 100 && (
                    <CustomLoaderSpinner
                      style={{
                        scale: "0.5",
                        position: "absolute",
                        left: "50%",
                      }}
                      processPercent={wavesurferVideosAudioLoadingPercent}
                    />
                  )}
                  <div className="timeline_asset_icon">
                    {tXsplit === "0" ? (
                      <IconWrapper icon="Voice" />
                    ) : (
                      <IconWrapper icon="Music" />
                    )}
                  </div>
                  <div
                    className={`timeline_voice_music_volume_slider_wrapper ${tXsplit === "0" ? "voice" : "music"
                      }`}
                  >
                    <div
                      className={`timeline_voice_music_volume_slider_container`}
                    >
                      <div className="slider_container">
                        <SliderInputWrapper
                          min={0}
                          max={1}
                          step={0.1}
                          value={
                            tXsplit === "0"
                              ? timelineVoiceVolume
                              : timelineMusicVolume
                          }
                          onChange={(vol) => {
                            dispatch(
                              SET_PROJECT_META(
                                tXsplit === "0"
                                  ? { timelineVoiceVolume: +vol }
                                  : { timelineMusicVolume: +vol }
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                    <IconWrapper
                      className={`timeline_voice_volume_speaker_icon`}
                      icon={
                        tXsplit === "0"
                          ? +timelineVoiceVolume === 0
                            ? "SpeakerMute"
                            : "Speaker"
                          : +timelineMusicVolume === 0
                            ? "SpeakerMute"
                            : "Speaker"
                      }
                      onClick={() => {
                        dispatch(
                          SET_PROJECT_META(
                            tXsplit === "0"
                              ? {
                                timelineVoiceVolume:
                                  // +timelineVoiceVolume !== 0 ? 0 : 0.6,
                                  +timelineVoiceVolume !== 0 ? 0 : 1,
                              }
                              : {
                                timelineMusicVolume:
                                  // +timelineMusicVolume !== 0 ? 0 : 0.4,
                                  +timelineMusicVolume !== 0 ? 0 : 1,
                              }
                          )
                        );
                      }}
                    />
                  </div>
                </div>
              )}
              {
                brandMeta?.aiMusicProvider === "stability" ? (
                  Boolean(audioObjectUrl) && (
                    <div className="timeline_AI_music_container">
                      <div
                        className="waveform-timeline"
                        id="waveform"
                        key={`${currentUseThisTrack}-${projectDurationInsec}`}
                      >
                        <WaveSurfer onMount={handleWSMountStability}>
                          <WaveForm
                            barWidth={1} //1
                            barRadius={1} //1
                            hideScrollbar
                            barGap={2} //5
                            barMinHeight={1} //2
                            cursorWidth={0}
                            progressColor={theme?.["--color-wave-progress"]}
                            waveColor={theme?.["--color-wave-bg"]}
                            container={document.querySelector("#waveform")}
                            height={30} //100
                            responsive
                            hideCursor={true}
                            id={`waveform-timeline${currentUseThisTrack}`}
                          ></WaveForm>
                        </WaveSurfer>
                      </div>
                      {waveSurferLoadingPercent !== 100 && (
                        <CustomLoaderSpinner
                          style={{
                            scale: "0.5",
                            position: "absolute",
                            left: "50%",
                          }}
                          processPercent={waveSurferLoadingPercent}
                        />
                      )}
                      <div className="timeline_asset_icon">
                        <IconWrapper icon="Music" />
                      </div>
                      <div className="timeline_music_volume_slider_wrapper">
                        <div className={`timeline_music_volume_slider_container`}>
                          <div className="slider_container">
                            <SliderInputWrapper
                              min={0}
                              max={1}
                              step={0.1}
                              value={timelineMusicVolume}
                              onChange={(vol) => {
                                dispatch(
                                  SET_PROJECT_META({ timelineMusicVolume: +vol })
                                );
                              }}
                            />
                          </div>
                        </div>
                        <IconWrapper
                          className={`timeline_voice_volume_speaker_icon`}
                          icon={
                            +timelineMusicVolume === 0 ? "SpeakerMute" : "Speaker"
                          }
                          onClick={() => {
                            dispatch(
                              SET_PROJECT_META({
                                timelineMusicVolume:
                                  // +timelineMusicVolume !== 0 ? 0 : 0.4,
                                  +timelineMusicVolume !== 0 ? 0 : 1,
                              })
                            );
                          }}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  Boolean(selectedAIMusicDetails?.cue_id) && (
                    <div className="timeline_AI_music_container">
                      <div
                        className="waveform-timeline"
                        id="waveform"
                        key={`${selectedAIMusicDetails?.settings?.length}-${projectDurationInsec}`}
                      >
                        <WaveSurfer onMount={handleWSMount}>
                          <WaveForm
                            barWidth={1} //1
                            barRadius={1} //1
                            hideScrollbar
                            barGap={2} //5
                            barMinHeight={1} //2
                            cursorWidth={0}
                            progressColor={theme?.["--color-wave-progress"]}
                            waveColor={theme?.["--color-wave-bg"]}
                            container={document.querySelector("#waveform")}
                            height={30} //100
                            responsive
                            hideCursor={true}
                            id={`waveform-timeline${selectedAIMusicDetails?.cue_id}`}
                          ></WaveForm>
                        </WaveSurfer>
                      </div>
                      {waveSurferLoadingPercent !== 100 && (
                        <CustomLoaderSpinner
                          style={{
                            scale: "0.5",
                            position: "absolute",
                            left: "50%",
                          }}
                          processPercent={waveSurferLoadingPercent}
                        />
                      )}
                      <div className="timeline_asset_icon">
                        <IconWrapper icon="Music" />
                      </div>
                      <div className="timeline_music_volume_slider_wrapper">
                        <div className={`timeline_music_volume_slider_container`}>
                          <div className="slider_container">
                            <SliderInputWrapper
                              min={0}
                              max={1}
                              step={0.1}
                              value={timelineMusicVolume}
                              onChange={(vol) => {
                                dispatch(
                                  SET_PROJECT_META({ timelineMusicVolume: +vol })
                                );
                              }}
                            />
                          </div>
                        </div>
                        <IconWrapper
                          className={`timeline_voice_volume_speaker_icon`}
                          icon={
                            +timelineMusicVolume === 0 ? "SpeakerMute" : "Speaker"
                          }
                          onClick={() => {
                            dispatch(
                              SET_PROJECT_META({
                                timelineMusicVolume:
                                  // +timelineMusicVolume !== 0 ? 0 : 0.4,
                                  +timelineMusicVolume !== 0 ? 0 : 1,
                              })
                            );
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              {thumbnails?.length !== 0 && uploadedVideoURL && (
                <div
                  className="timeline_video_container"
                  id={"timeline_video_container"}
                >
                  {thumbnails?.map((item, i) => {
                    return (
                      <img
                        key={"thumbnails_WS" + i + item}
                        className={"thumbnail_img"}
                        src={item}
                        style={{
                          width: `calc(100% - 20px/16)`,
                          display: imageLoadingError ? "none" : "block",
                        }}
                        alt={"thumbnails_WS" + i + item}
                        onError={() => {
                          setImageLoadingError(true);
                        }}
                        onLoad={() => {
                          let isLastImage = i === thumbnails.length - 1;
                          if (isLastImage) {
                            setTimeout(() => {
                              setIsTimelineReady((prev) => ({
                                ...prev,
                                video: true,
                              }));
                            }, 1000);
                          }
                          setImageLoadingError(false);
                        }}
                      />
                    );
                  })}
                  {/* <ThumbnailList
                    setIsTimelineReady={setIsTimelineReady}
                    thumbnails={thumbnails}
                  /> */}
                  <div className="timeline_asset_icon">
                    <IconWrapper icon="VideoClip" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
