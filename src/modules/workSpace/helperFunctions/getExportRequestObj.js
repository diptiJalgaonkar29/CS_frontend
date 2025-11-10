import { round } from "lodash";
import { store } from "../../../reduxToolkit/store";
import { brandConstants } from "../../../utils/brandConstants";
import getSuperBrandName from "../../../utils/getSuperBrandName";
import getConfigJson from "../../../utils/getConfigJson";

const exportMusicOnly = ({
  tXfilePath,
  tXsplit,
  superBrandName,
  projectID,
  cueAudioFileUrl,
  exportVolume,
  projectDurationInsec,
}) => {

  console.log()
  const isSplit = tXfilePath && tXsplit === "1";

  const fileInputCMD = isSplit
    ? `-i "{{AUDIO_FROM_VIDEO_ROOT_PATH}}/${superBrandName}/${projectID}/${tXfilePath}"`
    : `-i "${cueAudioFileUrl}"`;

  const volume = parseFloat(exportVolume ?? 1);

  const finalCMD = `ffmpeg ${fileInputCMD} -filter_complex "[0:a]volume=${volume},apad" -t ${projectDurationInsec?.toFixed(
    1
  )} -c:a libmp3lame -b:a 320k`;
  return finalCMD;
};

const exportAIVoiceOnly = ({
  TTSTimelineVoicesMP3,
  exportVolume,
  projectDurationInsec,
  VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT,
}) => {
  console.log("chk ffmpegcommand: exportAIVoiceOnly", 
    TTSTimelineVoicesMP3, exportVolume,
    projectDurationInsec,
    VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT);
  let fileInputCMD = "";
  let voicesDelayCMD = "";
  let filesArr = "";
  TTSTimelineVoicesMP3.forEach((ele, index) => {
    let mp3FileName = ele?.mp3;

    // input
    fileInputCMD += `-i "${mp3FileName}" `;

    // delay and volume
    const delay = (ele?.startPoint * 1000)?.toFixed(0);
    voicesDelayCMD += `[${index}]loudnorm=I=-16:LRA=11:TP=-1.5,adelay=${delay}|${delay},volume=${exportVolume},apad[voice${index + 1}];`;

    // mix parts
    filesArr += `[voice${index + 1}]`;
  });

  const finalCMD = `ffmpeg ${fileInputCMD}-filter_complex "${voicesDelayCMD} ${filesArr}amix=inputs=${TTSTimelineVoicesMP3?.length
    }[mixed];[mixed]aresample=async=1:first_pts=0,volume=${VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT}[out]" \-map "[out]" -t ${projectDurationInsec?.toFixed(
      1
    )} -c:a libmp3lame -b:a 320k`;
    console.log("***002-finalCMD",finalCMD);
  return finalCMD;
};

const getExportRequestObj = ({
  exportLabel,
  formatselected,
  projectID,
  projectDurationInsec,
  uploadedVideoURL,
  selectedAIMusicDetails,
  TTSTimelineVoicesMP3,
  selectedVoices,
  tXfilePath,
  tXsplit,
}) => {
  var { projectMeta } = store.getState();

  const {
    OUTPUT_BG_FADE_DURATION_IN_SEC,
    OUTPUT_FADE_NO_OF_STEPS,
    FADE_VOLUME_INCREMENT_DECREMENT,
    OUTPUT_VOICE_VOLUME_IN_DB,
    OUTPUT_MUSIC_VOLUME_IN_DB,
    VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT = 3.0,
    VOICE_VOLUME_FOR_VOICE_MUSIC_OUTPUT = 3.0,
    OUTPUT_VOLUME_FOR_VOICE_MUSIC = 2.0,
  } = getConfigJson();

  console.log("exportLabel", exportLabel)
  console.log("formatselected", formatselected)
  console.log("projectID", projectID)
  console.log("projectDurationInsec", projectDurationInsec)
  console.log("selectedAIMusicDetails", selectedAIMusicDetails)
  console.log("TTSTimelineVoicesMP3", TTSTimelineVoicesMP3)
  console.log("selectedVoices", selectedVoices)
  console.log("tXfilePath", tXfilePath)
  console.log("tXsplit", tXsplit)

  console.log("timelineVoiceVolume", projectMeta?.timelineVoiceVolume);
  console.log("timelineMusicVolume", projectMeta?.timelineMusicVolume);
  console.log("OUTPUT_VOICE_VOLUME_IN_DB", OUTPUT_VOICE_VOLUME_IN_DB);
  console.log("OUTPUT_MUSIC_VOLUME_IN_DB", OUTPUT_MUSIC_VOLUME_IN_DB);

  function getVolumes(voiceInput) {
    const voiceOutput = voiceInput * OUTPUT_VOICE_VOLUME_IN_DB;
    const musicOutput = voiceInput * OUTPUT_MUSIC_VOLUME_IN_DB;

    return {
      voice: voiceOutput,
      music: musicOutput,
    };
  }

  const OUTPUT_VOICE_VOLUME_WITH_TIMELINE_VOLUME_IN_DB = getVolumes(
    +projectMeta.timelineVoiceVolume
  )?.voice;

  const OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB = getVolumes(
    +projectMeta.timelineMusicVolume
  )?.music;

  console.log(
    "OUTPUT_VOICE_VOLUME_WITH_TIMELINE_VOLUME_IN_DB",
    OUTPUT_VOICE_VOLUME_WITH_TIMELINE_VOLUME_IN_DB
  );
  console.log(
    "OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB",
    OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB
  );

  const FADE_VOLUME_INCREMENT_DECREMENT_FACTOR =
    OUTPUT_FADE_NO_OF_STEPS * FADE_VOLUME_INCREMENT_DECREMENT;

  console.log("OUTPUT_FADE_NO_OF_STEPS", OUTPUT_FADE_NO_OF_STEPS);
  console.log(
    "FADE_VOLUME_INCREMENT_DECREMENT",
    FADE_VOLUME_INCREMENT_DECREMENT
  );
  console.log(
    "FADE_VOLUME_INCREMENT_DECREMENT_FACTOR",
    FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
  );

  let fileInputCMD = "";

  let voicesDelayCMD = "";
  let filesArr = "";
  let finalCMD = "";
  let superBrandName = getSuperBrandName();
  if (superBrandName === brandConstants.SONIC_SPACE) {
    superBrandName = brandConstants.AMP;
  }

  //AI MUSIC
  if (exportLabel === "Music Only") {
    if (formatselected === "stem") {
      const filteredStemData = Object.keys(selectedAIMusicDetails)
        .filter((key) => {
          return (
            key.startsWith("stem_") &&
            key.endsWith("_audio_file_url") &&
            !key.includes("percussion")
          );
        })
        ?.map((key) => {
          let keyName = key.slice(5).replace("_audio_file_url", "");
          return { label: keyName, value: selectedAIMusicDetails[key] };
        });

      return {
        projectId: projectID,
        conversion_type: exportLabel?.toLowerCase()?.replace(/ /g, "-"),
        videoFile: "",
        mp3ffmpeg_Command: "",
        result: "",
        outputType: "stem",
        stem: filteredStemData,
      };
    }
    if (["mp3", "wav"].includes(formatselected)) {
      const finalCMD = exportMusicOnly({
        cueAudioFileUrl: selectedAIMusicDetails?.cue_audio_file_url,
        exportVolume: projectMeta?.timelineMusicVolume,
        projectDurationInsec,
        projectID,
        superBrandName,
        tXfilePath,
        tXsplit,
      });
      return {
        projectId: projectID,
        conversion_type: exportLabel?.toLowerCase()?.replace(/ /g, "-"),
        videoFile: "",
        mp3ffmpeg_Command: finalCMD,
        result: "",
        outputType: formatselected,
      };
    }
  }

  //VOICE
  if (exportLabel === "Voice Only") {
    console.log("chk ffmpegcommand: getExportRequestObj-", exportLabel)
    if (formatselected === "stem") {
      let voiceArr = TTSTimelineVoicesMP3.map((data, index) => ({
        label: `Voice-${index + 1}`,
        value: data.mp3,
      }));
      return {
        projectId: projectID,
        conversion_type: exportLabel?.toLowerCase()?.replace(/ /g, "-"),
        videoFile: "",
        mp3ffmpeg_Command: "",
        result: "",
        outputType: "stem",
        stem: voiceArr,
      };
    }
    if (["mp3", "wav"].includes(formatselected)) {
      console.log("chk ffmpegcommand: formatselected", formatselected, tXfilePath, tXsplit);
      if (tXfilePath && tXsplit === "0") {
        console.log("tXsplit is 0")
        fileInputCMD = `-i "{{AUDIO_FROM_VIDEO_ROOT_PATH}}/${superBrandName}/${projectID}/${tXfilePath}"`;

        const volume = parseFloat(projectMeta?.timelineVoiceVolume ?? 1);

        finalCMD = `ffmpeg ${fileInputCMD} -filter_complex "[0:a]volume=${volume},apad" -t ${projectDurationInsec?.toFixed(
          1
        )} -c:a libmp3lame -b:a 320k`;
        console.log("chk ffmpegcommand: finalcmd1", finalCMD);
      } else {
        finalCMD = exportAIVoiceOnly({
          exportVolume: projectMeta.timelineVoiceVolume,
          projectDurationInsec,
          TTSTimelineVoicesMP3,
          VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT,
        });
        console.log("chk ffmpegcommand: finalcmd2", finalCMD);
      }
      console.log("***getExportRequestObj",finalCMD)
      return {
        projectId: projectID,
        conversion_type: exportLabel?.toLowerCase()?.replace(/ /g, "-"),
        videoFile: "",
        mp3ffmpeg_Command: finalCMD,
        result: "",
        outputType: formatselected,
      };
    }
  }

  if (["Voice & Music", "Final Mix"].includes(exportLabel)) {
    if (!!selectedAIMusicDetails?.cue_audio_file_url && !!tXfilePath) {
      // AI Music + Voice audio frpm video
      const fileInputCMD = `-i "${selectedAIMusicDetails?.cue_audio_file_url}" -i "{{AUDIO_FROM_VIDEO_ROOT_PATH}}/${superBrandName}/${projectID}/${tXfilePath}"`;

      const musicVolume = parseFloat(
        OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB ?? 1
      );
      const voiceVolume = parseFloat(
        OUTPUT_VOICE_VOLUME_WITH_TIMELINE_VOLUME_IN_DB ?? 1
      );

      const filterComplex = `[0:a]volume=${musicVolume}[music]; [1:a]volume=${voiceVolume}[voice]; [music][voice]amix=inputs=2,apad[out]`;

      finalCMD = `ffmpeg ${fileInputCMD} -filter_complex "${filterComplex}" -map "[out]" -t ${projectDurationInsec?.toFixed(
        1
      )} -c:a libmp3lame -b:a 320k`;
    } else if (!selectedAIMusicDetails?.cue_audio_file_url && !tXfilePath) {
      // Only AI Voice
      finalCMD = exportAIVoiceOnly({
        exportVolume: projectMeta.timelineVoiceVolume,
        projectDurationInsec,
        TTSTimelineVoicesMP3,
        VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT,
      });
    } else {
      if (TTSTimelineVoicesMP3?.length > 0) {
        if (projectMeta?.timelineMusicVolume === 0) {
          // voice only
          finalCMD = exportAIVoiceOnly({
            exportVolume: projectMeta.timelineVoiceVolume,
            projectDurationInsec,
            TTSTimelineVoicesMP3,
            VOICE_VOLUME_FOR_VOICE_ONLY_OUTPUT,
          });
        } else if (projectMeta?.timelineVoiceVolume === 0) {
          // music only
          finalCMD = exportMusicOnly({
            cueAudioFileUrl: selectedAIMusicDetails?.cue_audio_file_url,
            exportVolume: projectMeta?.timelineMusicVolume,
            projectDurationInsec,
            projectID,
            superBrandName,
            tXfilePath,
            tXsplit,
          });
        } else {
          if (selectedAIMusicDetails?.cue_audio_file_url) {
            fileInputCMD = `-i "${selectedAIMusicDetails?.cue_audio_file_url}" `; // AI Music
          } else {
            fileInputCMD = `-i "{{AUDIO_FROM_VIDEO_ROOT_PATH}}/${superBrandName}/${projectID}/${tXfilePath}" `; // Audio music from video
          }
          voicesDelayCMD = `adelay=0|0[music];`;
          filesArr = ``;
          let addFadeEffect = (startDuration, type) => {
            console.log("fade startDuration", startDuration);
            let fadeTransitionArray = new Array(OUTPUT_FADE_NO_OF_STEPS)
              .fill(+startDuration)
              .map((startDuration, index) => {
                let start =
                  startDuration +
                  index *
                  (OUTPUT_BG_FADE_DURATION_IN_SEC / OUTPUT_FADE_NO_OF_STEPS);
                let end =
                  start +
                  OUTPUT_BG_FADE_DURATION_IN_SEC / OUTPUT_FADE_NO_OF_STEPS;

                // Calculate volume based on type and other parameters
                function calculateVolume(type, index) {
                  const isFadeIn = type === "FADE_IN";
                  const baseVolume =
                    OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB;
                  const volumeAdjustment = isFadeIn
                    ? baseVolume -
                    FADE_VOLUME_INCREMENT_DECREMENT_FACTOR +
                    index * FADE_VOLUME_INCREMENT_DECREMENT
                    : baseVolume - index * FADE_VOLUME_INCREMENT_DECREMENT;

                  return Math.max(
                    FADE_VOLUME_INCREMENT_DECREMENT,
                    volumeAdjustment
                  )?.toFixed(2);
                }

                // Generate volume filter for FFmpeg
                function generateVolumeFilter(start, end, type, index) {
                  const startTime = +start?.toFixed(1);
                  const endTime = +end?.toFixed(1);

                  console.log("startTime", startTime)
                  console.log("endTime", endTime)
                  const volume = calculateVolume(type, index);

                  // Apply the volume using Math.min for any desired max volume limit
                  return `volume=enable='between(t,${startTime},${endTime})':volume=${Math.min(
                    1,
                    volume
                  )}:eval=frame`;
                }

                return generateVolumeFilter(
                  start,
                  end,
                  type,
                  index,
                  projectMeta
                );
              });
            // console.log(type, fadeTransitionArray.toString());
            return fadeTransitionArray.toString();
          };

          let bgMusicFadeEffectNew = ``;
          TTSTimelineVoicesMP3?.forEach((ele, index) => {
            //fileInputCMD
            fileInputCMD = fileInputCMD + `-i "${ele?.mp3}" `;

            let voiceStartRangeCurrent = +ele?.startPoint?.toFixed(1);
            let voiceEndRangeCurrent = +(
              +ele?.startPoint + +ele?.duration
            )?.toFixed(1);

            let voiceEndRangePrev = +(
              +TTSTimelineVoicesMP3[index - 1]?.startPoint +
              +TTSTimelineVoicesMP3[index - 1]?.duration
            )?.toFixed(1);

            let isLastClose =
              voiceStartRangeCurrent - voiceEndRangePrev <
              OUTPUT_BG_FADE_DURATION_IN_SEC * 2;

            //bgMusicFadeEffect
            // const VOICE_LEAD_LAG = 1;
            // const VOICE_TAIL_LAG = 3.8;
            const VOICE_LEAD_LAG = 0;
            const VOICE_TAIL_LAG = 0;

            // console.log("voiceStartRangeCurrent", voiceStartRangeCurrent);
            // console.log("voiceEndRangePrev", voiceEndRangePrev);
            // console.log(
            //   "voiceStartRangeCurrent - voiceEndRangePrev",
            //   voiceStartRangeCurrent - voiceEndRangePrev
            // );
            // console.log(
            //   "OUTPUT_BG_FADE_DURATION_IN_SEC",
            //   OUTPUT_BG_FADE_DURATION_IN_SEC
            // );
            // console.log("isLastClose", isLastClose);

            // console.log("*******************");
            let playableAudioStart = (
              voiceStartRangeCurrent + VOICE_LEAD_LAG
            )?.toFixed(1);
            let playableAudioEnd = (
              voiceEndRangeCurrent - VOICE_TAIL_LAG
            )?.toFixed(1);
            let playableAudioEndPrev = (
              voiceEndRangePrev - VOICE_TAIL_LAG
            )?.toFixed(1);
            let fadeOutStart =
              playableAudioStart - OUTPUT_BG_FADE_DURATION_IN_SEC;
            let fadeInStart = playableAudioEnd;

            if (index === 0) {
              let firstGap = `volume=enable='between(t,0,${+(
                +TTSTimelineVoicesMP3[0]?.startPoint -
                OUTPUT_BG_FADE_DURATION_IN_SEC || projectDurationInsec
              )?.toFixed(
                1
              )})':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

              let firstFadeOut = addFadeEffect(fadeOutStart, "FADE_OUT");

              let lowerBgVolume = `,volume=enable='between(t,${playableAudioStart},${playableAudioEnd})':volume=${Math.max(
                FADE_VOLUME_INCREMENT_DECREMENT,
                OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
              )}:eval=frame,`;

              // console.log("***bgMusicFadeEffectNew firstGap", firstGap);
              // console.log("***bgMusicFadeEffectNew firstFadeOut", firstFadeOut);
              // console.log("***bgMusicFadeEffectNew lowerBgVolume", lowerBgVolume);

              bgMusicFadeEffectNew =
                bgMusicFadeEffectNew +
                `${firstGap + firstFadeOut + lowerBgVolume}`;

              if (index === TTSTimelineVoicesMP3?.length - 1) {
                // console.log("Only one item in TTSTimelineVoicesMP3");
                let lastFadeIn = addFadeEffect(
                  (
                    +TTSTimelineVoicesMP3[0]?.startPoint +
                    +TTSTimelineVoicesMP3[0]?.duration
                  )?.toFixed(1),
                  "FADE_IN"
                );

                let lastGap = `,volume=enable='between(t,${(
                  +TTSTimelineVoicesMP3[0]?.startPoint +
                  +TTSTimelineVoicesMP3[0]?.duration +
                  +OUTPUT_BG_FADE_DURATION_IN_SEC
                )?.toFixed(1)},${projectDurationInsec})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB
                )}:eval=frame,`;
                // console.log("***bgMusicFadeEffectNew lastFadeIn", lastFadeIn);
                // console.log("***bgMusicFadeEffectNew lastGap", lastGap);
                bgMusicFadeEffectNew =
                  bgMusicFadeEffectNew + `${lastFadeIn + lastGap}`;
              }
            } else if (index === TTSTimelineVoicesMP3?.length - 1) {
              if (isLastClose) {
                // console.log(
                //   "***bgMusicFadeEffectNew isLastClose",
                //   isLastClose,
                //   index,
                //   index - 1
                // );

                let gapBetweenVoices = `volume=enable='between(t,${+playableAudioEndPrev},${playableAudioStart})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame`;

                let lowerVoice = `,volume=enable='between(t,${playableAudioStart},${playableAudioEnd})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame,`;

                // old code 
                // let lastFadeIn = addFadeEffect(fadeInStart, "FADE_IN");

                // let lastGap = `,volume=enable='between(t,${(
                //   +fadeInStart + OUTPUT_BG_FADE_DURATION_IN_SEC
                // )?.toFixed(1)},${+projectDurationInsec?.toFixed(
                //   1
                // )})':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

                // added new code
                let fadeStartNum = Number(fadeInStart) || 0;
                let fadeDurationNum = Number(OUTPUT_BG_FADE_DURATION_IN_SEC) || 0;

                let lastFadeIn = addFadeEffect(fadeStartNum, "FADE_IN");

                let lastGap = `,volume=enable='between(t,${(fadeStartNum + fadeDurationNum).toFixed(1)},${Number(projectDurationInsec || 0).toFixed(1)})':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

                // console.log(
                //   "***bgMusicFadeEffectNew gapBetweenVoices",
                //   gapBetweenVoices
                // );
                // console.log("***bgMusicFadeEffectNew lowerVoice", lowerVoice);
                // console.log("***bgMusicFadeEffectNew lastFadeIn", lastFadeIn);
                // console.log("***bgMusicFadeEffectNew lastGap", lastGap);

                bgMusicFadeEffectNew =
                  bgMusicFadeEffectNew +
                  `${gapBetweenVoices + lowerVoice + lastFadeIn + lastGap}`;
              } else {
                let prevLastFadeIn = addFadeEffect(
                  playableAudioEndPrev,
                  "FADE_IN"
                );

                let gapBetweenVoices = `,volume=enable='between(t,${+playableAudioEndPrev + OUTPUT_BG_FADE_DURATION_IN_SEC
                  },${playableAudioStart - OUTPUT_BG_FADE_DURATION_IN_SEC
                  })':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

                let lastFadeOut = addFadeEffect(fadeOutStart, "FADE_OUT");

                let lowerVoice = `,volume=enable='between(t,${playableAudioStart},${playableAudioEnd})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame,`;

                let lastFadeIn = addFadeEffect(fadeInStart, "FADE_IN");
                console.log("TTSTimelineVoicesMp3 ",fadeInStart,OUTPUT_BG_FADE_DURATION_IN_SEC,projectDurationInsec)

                let updatedVal = Number(fadeInStart) + Number(OUTPUT_BG_FADE_DURATION_IN_SEC)

                 let lastGap = `,volume=enable='between(t,${(updatedVal)?.toFixed(1)},${+projectDurationInsec?.toFixed(1)})':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

               // let lastGap = `,volume=enable='between(t,${(+fadeInStart + OUTPUT_BG_FADE_DURATION_IN_SEC)?.toFixed(1)},${+projectDurationInsec?.toFixed(1)})':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}eval=frame,`;

                bgMusicFadeEffectNew =
                  bgMusicFadeEffectNew +
                  `${prevLastFadeIn +
                  gapBetweenVoices +
                  lastFadeOut +
                  lowerVoice +
                  lastFadeIn +
                  lastGap
                  }`;
                // console.log(
                //   "***bgMusicFadeEffectNew prevLastFadeIn",
                //   prevLastFadeIn
                // );
                // console.log(
                //   "***bgMusicFadeEffectNew gapBetweenVoices",
                //   gapBetweenVoices
                // );
                // console.log("***bgMusicFadeEffectNew lastFadeOut", lastFadeOut);
                // console.log("***bgMusicFadeEffectNew lowerVoice", lowerVoice);
                // console.log("***bgMusicFadeEffectNew lastFadeIn", lastFadeIn);
                // console.log("***bgMusicFadeEffectNew lastGap", lastGap);
              }
            } else {
              if (isLastClose) {
                // console.log(
                //   "***bgMusicFadeEffectNew isLastClose",
                //   isLastClose,
                //   index,
                //   index - 1
                // );

                let gapBetweenVoices = `volume=enable='between(t,${+playableAudioEndPrev},${playableAudioStart})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame`;

                let lowerVoice = `,volume=enable='between(t,${playableAudioStart},${playableAudioEnd})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame,`;

                // console.log(
                //   "***bgMusicFadeEffectNew gapBetweenVoices",
                //   gapBetweenVoices
                // );
                // console.log("***bgMusicFadeEffectNew lowerVoice", lowerVoice);

                bgMusicFadeEffectNew =
                  bgMusicFadeEffectNew + `${gapBetweenVoices + lowerVoice}`;
              } else {
                let prevLastFadeIn = addFadeEffect(
                  playableAudioEndPrev,
                  "FADE_IN"
                );

                let gapBetweenVoices = `,volume=enable='between(t,${+playableAudioEndPrev + OUTPUT_BG_FADE_DURATION_IN_SEC
                  },${playableAudioStart - OUTPUT_BG_FADE_DURATION_IN_SEC
                  })':volume=${OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB}:eval=frame,`;

                let lastFadeOut = addFadeEffect(fadeOutStart, "FADE_OUT");

                let lowerVoice = `,volume=enable='between(t,${playableAudioStart},${playableAudioEnd})':volume=${Math.max(
                  FADE_VOLUME_INCREMENT_DECREMENT,
                  OUTPUT_MUSIC_VOLUME_WITH_TIMELINE_VOLUME_IN_DB -
                  FADE_VOLUME_INCREMENT_DECREMENT_FACTOR
                )}:eval=frame,`;

                // console.log(
                //   "***bgMusicFadeEffectNew prevLastFadeIn",
                //   prevLastFadeIn
                // );
                // console.log(
                //   "***bgMusicFadeEffectNew gapBetweenVoices",
                //   gapBetweenVoices
                // );
                // console.log("***bgMusicFadeEffectNew lastFadeOut", lastFadeOut);
                // console.log("***bgMusicFadeEffectNew lowerVoice", lowerVoice);
                bgMusicFadeEffectNew =
                  bgMusicFadeEffectNew +
                  `${prevLastFadeIn + gapBetweenVoices + lastFadeOut + lowerVoice
                  }`;
              }
            }

            //voicesDelayCMD
            voicesDelayCMD =
              voicesDelayCMD +
              `[${index + 1
              }]loudnorm=I=-16:LRA=11:TP=-1.5,volume=${OUTPUT_VOICE_VOLUME_WITH_TIMELINE_VOLUME_IN_DB},adelay=${(
                ele?.startPoint * 1000
              )?.toFixed(0)}|${(ele?.startPoint * 1000)?.toFixed(0)},apad[voice${index + 1
              }];`;

            //filesArr
            filesArr = filesArr + `[voice${index + 1}]`;
          });

          finalCMD = `ffmpeg ${fileInputCMD}-filter_complex "${bgMusicFadeEffectNew} ${voicesDelayCMD} ${filesArr}amix=inputs=${TTSTimelineVoicesMP3?.length
            }[voices];[voices]volume=${VOICE_VOLUME_FOR_VOICE_MUSIC_OUTPUT}[voicesBoost];[music][voicesBoost]amix=inputs=2[mixed];[mixed]volume=${OUTPUT_VOLUME_FOR_VOICE_MUSIC}[out]" \-map "[out]" -t ${projectDurationInsec?.toFixed(
              1
            )} -c:a libmp3lame -b:a 320k`;
            console.log("***001-finalCMD",finalCMD)
        }
      } else {
        // only music or audio from video
        const isSplit = !!tXfilePath && !!tXsplit;

        const fileInputCMD = isSplit
          ? `-i "{{AUDIO_FROM_VIDEO_ROOT_PATH}}/${superBrandName}/${projectID}/${tXfilePath}"`
          : `-i "${selectedAIMusicDetails?.cue_audio_file_url}"`;

        const volume = parseFloat(
          (tXsplit === "0"
            ? projectMeta?.timelineVoiceVolume
            : projectMeta?.timelineMusicVolume) ?? 1
        );

        finalCMD = `ffmpeg ${fileInputCMD} -filter_complex "[0:a]volume=${volume},apad" -t ${projectDurationInsec?.toFixed(
          1
        )} -c:a libmp3lame -b:a 320k`;
      }
    }

    console.log({
      projectId: projectID,
      conversion_type:
        exportLabel === "Voice & Music"
          ? "voice-music"
          : exportLabel?.toLowerCase()?.replace(/ /g, "-"),
      videoFile: exportLabel === "Final Mix" ? uploadedVideoURL : "",
      mp3ffmpeg_Command: finalCMD,
      result: "",
      outputType: formatselected,
    })

    return {
      projectId: projectID,
      conversion_type:
        exportLabel === "Voice & Music"
          ? "voice-music"
          : exportLabel?.toLowerCase()?.replace(/ /g, "-"),
      videoFile: exportLabel === "Final Mix" ? uploadedVideoURL : "",
      mp3ffmpeg_Command: finalCMD,
      result: "",
      outputType: formatselected,
    };
  }

  if (exportLabel === "Script") {
    if (formatselected === "pdf") {
      let projectVoiceMeta = selectedVoices
        .flatMap((data) => data.content)
        .filter((data) => Boolean(data.mp3));
      return {
        projectId: projectID,
        conversion_type: "script",
        videoFile: "",
        mp3ffmpeg_Command: "",
        result: "",
        outputType: "pdf",
        scriptMeta: projectVoiceMeta,
      };
    }
  }
};

export default getExportRequestObj;
