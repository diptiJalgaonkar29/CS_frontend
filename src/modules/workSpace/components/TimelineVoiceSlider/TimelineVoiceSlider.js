import { Slider, Rail, Handles, Tracks } from "react-compound-slider";
import { SliderRail, Handle, Track } from "./TimelineVoiceSliderComponents"; // example render components - source
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_VOICE_META,
  UPDATE_TTS_TIMELINE_SLIDER_VALUES,
} from "../../redux/voicesSlice";
import "./TimelineVoiceSlider.css";
import showNotification from "../../../../common/helperFunctions/showNotification";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import { last } from "lodash";

const TimelineVoiceSlider = () => {
  const { projectDurationInsec } = useSelector((state) => state.projectMeta);
  const { uploadedVideoURL, uploadedVideoBlobURL } = useSelector(
    (state) => state.video
  );
  const dispatch = useDispatch();
  const { TTSTimelineVoicesMP3 } = useSelector((state) => state.voices);
  const start = 0;
  const duration = +projectDurationInsec;
  const domain = [start, duration];

  const [values, setValues] = useState(
    TTSTimelineVoicesMP3?.map((data) => +data?.startPoint) || []
  );
  const [update, setupdate] = useState(
    TTSTimelineVoicesMP3?.map((data) => +data?.startPoint) || []
  );
  // const [isDisabled, setDisabled] = useState(true);
  const [isOverlapped, setIsOverlapped] = useState(false);
  const [changedIndex, setChangedIndex] = useState("");

  const TTSTimelineVoicesMP3Memo = useMemo(
    () => TTSTimelineVoicesMP3,
    [TTSTimelineVoicesMP3]
  );

  useEffect(() => {
    if (TTSTimelineVoicesMP3?.length <= 0) return;
    const lastVoiceItem = last(TTSTimelineVoicesMP3);
    const ttsVoicesEndPoint = roundUpToDecimal(
      Math.ceil(+lastVoiceItem?.startPoint + +lastVoiceItem?.duration)
    );
    const IS_EXCEEDING_PROJECT_LENGTH =
      ttsVoicesEndPoint > projectDurationInsec;
    console.log("ttsVoicesEndPoint", ttsVoicesEndPoint);
    console.log("projectDurationInsec", projectDurationInsec);
    const id = setTimeout(() => {
      if (IS_EXCEEDING_PROJECT_LENGTH) {
        showNotification(
          "WARNING",
          "Project length and voice timeline length do not match, please update project length or edit voices",
          5000
        );
        if (!!uploadedVideoURL || !!uploadedVideoBlobURL) return;
        dispatch(
          SET_VOICE_META({
            isUpdateProjectLengthSameAsTTSVoicesModalOpen: true,
          })
        );
      }
    }, 250);
    return () => {
      clearTimeout(id);
    };
  }, [TTSTimelineVoicesMP3Memo, projectDurationInsec]);

  useEffect(() => {
    let defaultValues =
      TTSTimelineVoicesMP3?.map((data) => +data?.startPoint) || [];
    setValues(defaultValues);
    setupdate(defaultValues);
  }, [projectDurationInsec]);

  useEffect(() => {
    if (values?.some((value) => isNaN(value))) return;
    dispatch(UPDATE_TTS_TIMELINE_SLIDER_VALUES(values));
  }, [values]);

  const onUpdate = (update) => {
    isOverlapped && setIsOverlapped(false);
    setupdate(update);
  };

  const onChange = (change) => {
    setValues(change);
  };

  const sliderStyle = {
    position: "relative",
    width: "100%",
  };

  const avoidOverlappingVoices = (updatedValuesArr, activeHandleID) => {
    let changedItemIndex = Number(activeHandleID.replace("$$-", ""));
    setChangedIndex(activeHandleID);
    let prevItem = TTSTimelineVoicesMP3?.[changedItemIndex - 1];
    let selectedItem = TTSTimelineVoicesMP3?.[changedItemIndex];

    let leftLimit =
      changedItemIndex === 0
        ? 0
        : +updatedValuesArr?.[changedItemIndex - 1] + +prevItem?.duration;
    let rightLimit =
      updatedValuesArr?.[changedItemIndex + 1] || +projectDurationInsec;
    let currentStartPoint = +updatedValuesArr?.[changedItemIndex];
    let currentEndPoint =
      +updatedValuesArr?.[changedItemIndex] + +selectedItem?.duration;
    let resetArr = [...values];
    // console.log("updatedValuesArr", updatedValuesArr);
    // console.log("prevValuesArr", resetArr);
    // console.log("leftLimit", leftLimit);
    // console.log("currentStartPoint", currentStartPoint);
    // console.log("currentEndPoint", currentEndPoint);
    // console.log("rightLimit", rightLimit);
    // console.log("leftLimit > currentStartPoint", leftLimit > currentStartPoint);
    // console.log("rightLimit < currentEndPoint", rightLimit < currentEndPoint);
    if (currentEndPoint > rightLimit && rightLimit === projectDurationInsec) {
      setIsOverlapped(true);
      setTimeout(() => {
        showNotification(
          "WARNING",
          "Project length and voice timeline length do not match, please update project length or edit voices",
          5000
        );
        setValues(resetArr);
        setupdate(resetArr);
      }, 150);
    } else if (leftLimit > currentStartPoint || currentEndPoint > rightLimit) {
      setIsOverlapped(true);
      setTimeout(() => {
        showNotification("ERROR", "Please don't overlap the voices!");
        setValues(resetArr);
        setupdate(resetArr);
      }, 150);
    }
  };

  const showHideToolTip = (activeHandleID, toolTipVisibility) => {
    if (document.getElementById(`slider_${activeHandleID}`)) {
      document.getElementById(`slider_${activeHandleID}`).style.visibility =
        toolTipVisibility;
    }
    if (document.getElementById(`slider_tooltip_${activeHandleID}`)) {
      document.getElementById(
        `slider_tooltip_${activeHandleID}`
      ).style.visibility = toolTipVisibility;
    }
  };

  const newValues = useMemo(() => {
    // console.log("TTSTimelineVoicesMP3", TTSTimelineVoicesMP3);
    // console.log("values****", values);
    // console.log("isOverlapped****", isOverlapped);
    return TTSTimelineVoicesMP3?.map((data) => +data?.startPoint).filter(
      (value) => value < projectDurationInsec
    );
  }, [values, TTSTimelineVoicesMP3, projectDurationInsec, isOverlapped]);

  // useEffect(() => {
  //   console.log("newValues----", newValues);
  // }, [JSON.stringify(newValues)]);

  return (
    <div className="voice_slider_timeline_wrapper">
      <Slider
        mode={2}
        step={0.1}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={onUpdate}
        onChange={onChange}
        values={newValues || []}
        // disabled={isDisabled}
        onSlideStart={(e, { activeHandleID }) => {
          showHideToolTip(activeHandleID, "visible");
          document.body.style.cursor = "pointer";
        }}
        onSlideEnd={(endValues, { activeHandleID }) => {
          avoidOverlappingVoices(endValues, activeHandleID);
          showHideToolTip(activeHandleID, "hidden");
          document.body.style.cursor = "auto";
        }}
      >
        <Rail>
          {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles?.map((handle, i) => (
                <Handle
                  width={roundUpToDecimal(TTSTimelineVoicesMP3?.[i]?.duration)}
                  color={
                    TTSTimelineVoicesMP3?.[i]?.color ||
                    (TTSTimelineVoicesMP3?.[i]?.gender === "Male"
                      ? "var(--color-male-voice)"
                      : "var(--color-female-voice)")
                  }
                  voiceUUID={TTSTimelineVoicesMP3?.[i]?.voiceUUID}
                  currentValue={update[i]}
                  key={`handles${i}`}
                  handle={handle}
                  domain={domain}
                  getHandleProps={getHandleProps}
                  // onMouseOver={() => {
                  //   setDisabled(false);
                  // }}
                  // onMouseOut={() => {
                  //   setDisabled(true);
                  // }}
                  isOverlapped={isOverlapped}
                  changedIndex={changedIndex}
                />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks?.map(({ id, source, target }) => (
                <Track
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
      </Slider>
    </div>
  );
};

export default TimelineVoiceSlider;
