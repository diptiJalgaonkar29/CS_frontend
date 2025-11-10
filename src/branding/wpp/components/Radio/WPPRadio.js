import React from "react";
import { WppRadio } from "@wppopen/components-library-react";
import "./WPPRadio.css";

const WPPRadio = ({
  field,
  label = "",
  allowHtmlLabel = false,
  name,
  id,
  value,
  ...props
}) => {
  if (allowHtmlLabel) {
    return (
      <label htmlFor={id} style={{ display: "flex", gap: "10px" }}>
        <WppRadio
          {...field}
          {...props}
          id={id}
          onWppChange={props?.onChange || field?.onChange}
          required
        />
        {label}
      </label>
    );
  } else {
    return (
      <WppRadio
        labelConfig={{ text: label }}
        {...field}
        {...props}
        id={id}
        onWppChange={props?.onChange || field?.onChange}
        required
      />
    );
  }
};
export default WPPRadio;
