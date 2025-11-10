import React from "react";
import "./SonicProgressBar.css";

const SonicProgressBar = ({ processPercent }) => {
  return (
    <div className="custom_progress_bar_container">
      <div className="parent_div">
        <div className="child_div" style={{ width: `${processPercent}%` }} />
      </div>
    </div>
  );
};

export default SonicProgressBar;
