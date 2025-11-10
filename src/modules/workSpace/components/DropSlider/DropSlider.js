import * as React from "react";
import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import DropStart from "../../../../static/drop_point/dropStart.svg";
import SelectDrop from "../../../../static/drop_point/selectDrop.svg";
import DropEnd from "../../../../static/drop_point/dropEnd.svg";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import "./DropSlider.css";
import { debounce } from "lodash";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";

function formatDuration(value) {
  const minute = Math.floor(value / 60);
  const secondLeft = (value - minute * 60).toFixed(1);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

export default function MusicPlayerSlider() {
  const dispatch = useDispatch();
  const { trackDuration, dropPosition, isDrop } = useSelector(
    (state) => state.AIMusic
  );
  const [dropValue, setDropValue] = useState(dropPosition);

  const sliderStyle = {
    height: 2,
    color: "#797979",
    "& .MuiSlider-track": {
      border: "none",
    },
    "& .MuiSlider-thumb": {
      height: 23,
      width: 23,
      zIndex: 2,
      backgroundImage: `url(${SelectDrop})`,
      border: "none",
    },
    "& .MuiSlider-valueLabel": {
      lineHeight: 1.2,
      fontSize: 12,
      background: "unset",
      padding: 0,
      width: 50,
      height: 25,
      borderRadius: "25px 25px 25px 25px",
      backgroundColor: "var(--color-primary)",
      color: "#000",
      "&:before": {
        display: "block",
        content: '""',
        zIndex: -1,
        background: "var(--color-primary)",
        position: "absolute",
        width: "1px",
        height: 120,
        bottom: -120,
        transform: "rotate(0deg)",
      },
      "&:after": {
        display: "block",
        content: '""',
        zIndex: -10,
        background: "var(--color-primary)",
        position: "absolute",
        width: 15,
        height: 15,
        top: 12,
        transform: "rotate(45deg)",
      },
      "&.MuiSlider-valueLabelOpen": {
        transform: "translate(0%, -120px)  scale(1)",
      },
    },
  };

  useEffect(() => {
    setDropValue(dropPosition);
  }, [dropPosition]);

  const debounceDropUpdate = useCallback(
    debounce((drop) => {
      dispatch(
        SET_AI_MUSIC_META({
          dropPosition: drop,
        })
      );
    }, 500),
    []
  );

  return (
    <>
      <div className="drop_slider_container">
        <p></p>
        <div className="drop_slider_wrapper">
          <img src={DropStart} alt="start" className="drop_start_img" />
          <Slider
            valueLabelDisplay="auto"
            aria-label="time-indicator"
            size="sm"
            value={dropValue}
            min={0.1}
            max={trackDuration - 0.1}
            step={0.1}
            // disabled={!isDrop}
            valueLabelFormat={(x) => formatDuration(x)}
            onChange={(_, value) => {
              debounceDropUpdate(value);
              setDropValue(value);
            }}
            sx={sliderStyle}
          />
          <img src={DropEnd} alt="end" className="drop_end_img" />
        </div>
      </div>
    </>
  );
}
