import React from "react";
import { WppInput } from "@wppopen/components-library-react";
import SonicInputError from "../../../sonicspace/components/InputError/SonicInputError";
import SonicInputLabel from "../../../sonicspace/components/InputLabel/SonicInputLabel";
import "./WPPInput.css";

export const WPPInput = ({
  field,
  label = "",
  size = "m",
  form,
  id,
  className,
  showError = true,
  ...props
}) => {
  return (
    <div className={`wpp_input_container`}>
      {!!label && <SonicInputLabel htmlFor={id}>{label}</SonicInputLabel>}
      <WppInput
        // labelConfig={{ text: label }}
        class={`wpp_input ${size}`}
        type="text"
        id={id}
        {...field}
        {...props}
        onWppChange={props?.onChange || field?.onChange}
      />
      {showError &&
        form?.touched?.[field?.name] &&
        form?.errors?.[field?.name] && (
          <SonicInputError>{form?.errors[field?.name]}</SonicInputError>
        )}
    </div>
  );
};
