import { WppPill, WppPillGroup } from "@wppopen/components-library-react";
import React from "react";
import "../../theme/shadow-part.css";

const WPPChip = ({ label, onClose, ...rest }) => {
  return (
    <WppPillGroup type="display">
      <WppPill
        {...rest}
        label={label}
        value={label}
        removable={!!onClose}
        onWppClose={onClose}
      />
    </WppPillGroup>
  );
};

export default WPPChip;
