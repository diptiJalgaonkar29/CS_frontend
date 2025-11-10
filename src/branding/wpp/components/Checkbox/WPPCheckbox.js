import React from "react";
import { WppCheckbox } from "@wppopen/components-library-react";

const WPPCheckbox = ({ field, label = "", ...props }) => {
  return (
    <WppCheckbox
      labelConfig={{ text: label }}
      {...field}
      {...props}
      // onWppChange={({ detail: { checked } }) => setChecked(checked)}
      onWppChange={props?.onChange || field?.onChange}
      required
    />
  );
};

export default WPPCheckbox;
