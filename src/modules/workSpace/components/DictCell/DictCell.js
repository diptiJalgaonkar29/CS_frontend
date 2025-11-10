import React from "react";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import "./DictCell.css";

const DictCell = ({ value, isDisabled, label = "", id = "" }) => {
  return (
    <div className="dict_input_wrapper">
      {label !== "" && <div className="ogWord_header">{label}</div>}
      <div className="DictCell_container" id={id}>
        <CustomToolTip title={value}>
          <p
            className={`DictCell_name ${
              isDisabled
                ? "disabled_edior_name disabled_name"
                : "active_edior_name"
            }`}
          >
            {value}
          </p>
        </CustomToolTip>
      </div>
    </div>
  );
};

export default DictCell;
