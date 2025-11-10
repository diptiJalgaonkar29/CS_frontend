import { WppDatepicker } from "@wppopen/components-library-react";
import React from "react";

const WPPDatePicker = ({ onChange, views, format, ...props }) => {
  return (
    <WppDatepicker
      view="months"
      minView="months"
      locale={{ dateFormat: format }}
      {...props}
      onWppChange={(e) => {
        onChange(e?.detail?.date);
      }}
    />
  );
};

export default WPPDatePicker;
