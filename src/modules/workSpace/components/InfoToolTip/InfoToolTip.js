import React from "react";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const InfoToolTip = ({ children }) => {
  return (
    <CustomToolTip title={children} placement="bottom">
      <div>
        <IconWrapper
          icon={"Info"}
          className="track_info_tooltip voice_card_icon_large"
        />
      </div>
    </CustomToolTip>
  );
};

export default InfoToolTip;
