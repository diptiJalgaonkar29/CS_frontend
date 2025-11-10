import React from "react";
import { WppTextareaInput } from "@wppopen/components-library-react";
import SonicInputLabel from "../../../sonicspace/components/InputLabel/SonicInputLabel";
import SonicInputError from "../../../sonicspace/components/InputError/SonicInputError";
import "./WPPTextArea.css";

export const WPPTextArea = ({
  field,
  label = "",
  form,
  id,
  className,
  showError = true,
  ...props
}) => {
  return (
    <div className="wpp_textarea_container">
      {!!label && <SonicInputLabel htmlFor={id}>{label}</SonicInputLabel>}
      <WppTextareaInput
        {...field}
        {...props}
        id={id}
        // labelConfig={{ text: label }}
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
