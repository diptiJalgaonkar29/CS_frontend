import React from "react";
import PropTypes from "prop-types";
import formatTime from "../../../../utils/formatTime";
import "./TimelineVoiceScaleComponents.css";

export function Tick({ tick, count, format }) {
  return (
    <>
      <div
        style={{
          left: `${tick.percent}%`,
        }}
        className="tick_outer"
      />
      <div
        style={{
          left: `${tick.percent}%`,
        }}
        className="tick_inner boldFamily"
      >
        {formatTime(tick.value)}
      </div>
    </>
  );
}

Tick.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  count: PropTypes.number.isRequired,
  format: PropTypes.func.isRequired,
};

Tick.defaultProps = {
  format: (d) => d,
};
