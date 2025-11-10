import React, { Fragment } from "react";
import PropTypes from "prop-types";
import formatTime from "../../../../utils/formatTime";
import "./TimelineVoiceSliderComponents.css";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";

// *******************************************************
// RAIL
// *******************************************************
const railOuterStyle = {
  position: "absolute",
  width: "100%",
  height: 50,
  transform: "translate(0%, -50%)",
  borderRadius: 7,
  pointerEvents: "none",
};

const railInnerStyle = {
  position: "absolute",
  width: "100%",
  height: 5,
  transform: "translate(0%, -50%)",
  borderRadius: 7,
  pointerEvents: "none",
  backgroundColor: "rgb(155,155,155)",
};

export function SliderRail() {
  return (
    <Fragment>
      <div style={railOuterStyle} />
      <div style={railInnerStyle} />
    </Fragment>
  );
}

SliderRail.propTypes = {
  getRailProps: PropTypes.func.isRequired,
};

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
export function Handle({
  width,
  currentValue,
  color,
  voiceUUID,
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
  onMouseOver,
  onMouseOut,
  isOverlapped,
  changedIndex,
}) {
  return (
    <div
      role="slider"
      id={id}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className={`slider_thumb_container ${
        isOverlapped && changedIndex === id ? "bounce" : ""
      }`}
      onClick={() => {
        console.log("id", `inputbox_${voiceUUID}`);
        try {
          var element = document.getElementById(`inputbox_${voiceUUID}`);
          if (element) {
            // console.log("window.pageYOffset", window.pageYOffset);
            const elementPosition =
              element.getBoundingClientRect().top + window.pageYOffset;

            // Offset value (e.g., header height or desired padding)
            const offset = 70;

            window.scrollTo({
              top: elementPosition - offset,
              behavior: "smooth",
            });
          }
        } catch (error) {
          console.log("error", error);
        }
      }}
      style={{
        left: `${percent}%`,
        position: "absolute",
        transform: "translate(0%, -50%)",
        zIndex: 2,
        width: `${roundUpToDecimal((100 * width) / max)}%`,
        height: 16,
        borderRadius: "30px",
        backgroundColor: color,
        transition: `left ${isOverlapped ? "0.2s" : "0s"}`,
        cursor: "pointer",
      }}
      {...getHandleProps(id)}
    >
      <div
        style={{
          width: "calc(100% - 20px)",
          margin: "0 auto",
          height: 16,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
        }}
      >
        {document.getElementById(`${id}`)?.offsetWidth > 62 ? (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              whiteSpace: "nowrap",
              width: "100%",
              overflow: "hidden",
              backgroundColor: color,
              color: "var(--color-white)",
              border: "none",
              textOverflow: "ellipsis",
              visibility: "hidden",
            }}
            className="timeline_slider_tooltip"
            id={`slider_${id}`}
          >
            {formatTime(currentValue, true)}
          </span>
        ) : (
          <span
            style={{
              fontSize: "12px",
              padding: "1px 5px",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-white)",
              border: "1px solid var(--color-white)",
              borderRadius: 5,
              position: "relative",
              top: "15px",
              left: "calc(100% + 10px)",
              visibility: "hidden",
            }}
            className="timeline_slider_tooltip_new"
            id={`slider_tooltip_${id}`}
          >
            {formatTime(currentValue, true)}
          </span>
        )}
      </div>
    </div>
  );
}

Handle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Handle.defaultProps = {
  disabled: false,
};

// *******************************************************
// TRACK COMPONENT
// *******************************************************
export function Track({ source, target, getTrackProps, disabled }) {
  return (
    <div
      style={{
        position: "absolute",
        transform: "translate(0%, -50%)",
        height: 5,
        zIndex: 1,
        pointerEvents: "none",
        borderRadius: 7,
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()}
    />
  );
}

Track.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Track.defaultProps = {
  disabled: false,
};
