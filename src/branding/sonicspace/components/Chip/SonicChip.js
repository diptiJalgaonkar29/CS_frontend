import React from "react";
import "./SonicChip.css";
import { ReactComponent as CloseIcon } from "../../../../static/supersearch/gsearch-close.svg";

const SonicChip = ({ label, children, className = "", onClose, ...rest }) => {
  return (
    <div
      className={`sonic_chip ${
        onClose ? "sonic_action_chip" : ""
      }  ${className}`}
      {...rest}
    >
      <span className={`sonic_chip_label`}>
        {label}
        {children}
      </span>
      {onClose && <CloseIcon onClick={onClose} />}
    </div>
  );
};

export default SonicChip;
