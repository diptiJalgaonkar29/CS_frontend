import React from "react";
import "./ChartLayout.css";

const ChartLayout = ({ startDate, endDate, label, children, id }) => {
  let customClassName = label?.replace(/\s+/g, "-")?.toLowerCase();
  return (
    <div className={`chart_layout_container ${customClassName}`} id={id}>
      <p className="date_range">
        Date range: {startDate} - {endDate}
      </p>
      <p className="label">{label}</p>
      {children}
    </div>
  );
};
export default ChartLayout;
