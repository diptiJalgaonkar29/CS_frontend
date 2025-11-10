import { Slider, Ticks } from "react-compound-slider";
import { Tick } from "./TimelineVoiceScaleComponents"; // example render components - source
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./TimelineVoiceScale.css";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import useDidMount from "../../../../customHooks/useDidMount";

const TimelineVoiceScale = ({ isCollapsed = false, thumbValue = 0 }) => {
  const progressBarDiv = useRef();
  const dispatch = useDispatch();
  const { projectDurationInsec } = useSelector((state) => state.projectMeta);
  const [newThumbValue, setNewThumbValue] = useState(thumbValue);
  const didMount = useDidMount();

  useEffect(() => {
    let debouncing;
    if (didMount) {
      debouncing = setTimeout(() => {
        dispatch(
          SET_PROJECT_META({
            timelineSeekTime: newThumbValue,
          })
        );
      }, 1);
    }
    return () => {
      clearTimeout(debouncing);
    };
  }, [newThumbValue]);

  return (
    <div
      className="timeline_scale_wrapper"
      style={{ cursor: "pointer" }}
      ref={progressBarDiv}
    >
      <div
        className={`timeline_scale_container ${
          isCollapsed ? "highlight" : "no_highlight"
        }`}
      />

      <Slider
        mode={2}
        step={0.1}
        domain={[0, +projectDurationInsec]}
        values={[]}
      >
        <input
          type={"range"}
          value={isNaN(thumbValue) ? 0 : thumbValue}
          min={0}
          max={+projectDurationInsec}
          step={0.1}
          onChange={(e) => {
            setNewThumbValue(e.target.value);
          }}
          className="timeline_seek_bar"
        />

        <Ticks count={8}>
          {({ ticks }) => (
            <div className="slider-ticks">
              {ticks?.map((tick) => (
                <Tick key={tick.id} tick={tick} count={ticks?.length} />
              ))}
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  );
};

export default TimelineVoiceScale;
