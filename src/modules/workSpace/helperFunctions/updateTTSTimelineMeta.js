import roundUpToDecimal from "../../../utils/roundUpToDecimal";

const updateTTSTimelineMeta = (selectedVoices, TTSTimelineVoicesMP3) => {
  let proccesedTTS = selectedVoices
    ?.flatMap((data) => data?.content)
    ?.filter((data) => Boolean(data?.mp3));

  if (proccesedTTS?.length == 0) {
    return [];
  }
  const GAP = 0.1;
  let combinedObj = proccesedTTS?.map((x) => {
    let a = TTSTimelineVoicesMP3?.find((y) => y.voiceUUID == x.voiceUUID);
    return { ...(a || {}), ...(x || {}) };
  });

  // console.log("combinedObj", JSON.stringify(combinedObj, null, 2));

  let gapIncrement = 0; // if any other voice with bigger length than previous
  let endPointInLoop = 0;
  let ttsObj = combinedObj.map((data, index) => {
    const prevItem = combinedObj?.[index - 1];

    // console.log("endPointInLoop start", endPointInLoop);
    // console.log("gapIncrement start", gapIncrement);

    let prevItemEndPoint = !prevItem
      ? 0
      : !prevItem?.startPoint
      ? endPointInLoop
      : roundUpToDecimal(+prevItem?.startPoint + +prevItem?.duration);

    // console.log(
    //   "prevItemEndPoint before endPointInLoop > prevItemEndPoint",
    //   prevItemEndPoint
    // );
    if (endPointInLoop > prevItemEndPoint) {
      prevItemEndPoint = roundUpToDecimal(+endPointInLoop);
    }

    // console.log("prevItemEndPoint", prevItemEndPoint);
    // console.log("current startPoint", data?.startPoint);

    let gapValue = index === 0 ? 0 : GAP;
    const isNewAdded = isNaN(parseFloat(data?.startPoint));
    // console.log("isNewAdded", isNewAdded);
    let currentStartPoint = isNewAdded
      ? roundUpToDecimal(+prevItemEndPoint + +gapValue + +gapIncrement)
      : roundUpToDecimal(+data?.startPoint + +gapValue + +gapIncrement);
    // console.log(
    //   "currentStartPoint before prevItemEndPoint > currentStartPoint",
    //   currentStartPoint
    // );

    if (prevItemEndPoint > currentStartPoint) {
      currentStartPoint = roundUpToDecimal(+prevItemEndPoint + +GAP);
    }

    // console.log("currentStartPoint", currentStartPoint);

    gapIncrement = 0;

    let currentEndPoint = roundUpToDecimal(
      +currentStartPoint + +data?.duration
    );

    // console.log("currentEndPoint", currentEndPoint);

    endPointInLoop = currentEndPoint; // created timeline length
    // console.log("endPointInLoop", endPointInLoop);

    const nextItem = combinedObj?.[index + 1];

    const nextItemStartPoint =
      !nextItem || !nextItem?.startPoint
        ? roundUpToDecimal(+currentEndPoint + +GAP)
        : roundUpToDecimal(nextItem?.startPoint);

    // console.log("nextItemStartPoint", nextItemStartPoint);

    if (currentEndPoint > nextItemStartPoint) {
      gapIncrement = currentEndPoint - nextItemStartPoint + gapValue;
    } else {
      console.log("No Overlap====");
    }
    // console.log("gapIncrement", gapIncrement);
    // console.log("*************************************************");

    return {
      mp3: data?.mp3,
      duration: data?.duration,
      color: data?.color,
      gender: data?.gender,
      voiceUUID: data?.voiceUUID,
      startPoint: +currentStartPoint ?? 0,
    };
  });
  // console.log("ttsObj", JSON.stringify(ttsObj, null, 2));
  return ttsObj;
};

export default updateTTSTimelineMeta;
