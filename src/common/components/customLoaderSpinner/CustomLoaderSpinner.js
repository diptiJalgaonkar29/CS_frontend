import React from "react";
import "./CustomLoaderSpinner.css";

const CustomLoaderSpinner = ({ style, processPercent = -1 }) => {
  return (
    <div style={style} className="lds-default">
      {[...new Array(12)].map((divEle, index) => (
        <div key={`loader_spinner_${index}`}></div>
      ))}
      {processPercent >= 0 && (
        <p className="loader_spinner_percentage">
          {processPercent?.toFixed(0)}%
        </p>
      )}
    </div>
  );
};

export default CustomLoaderSpinner;
