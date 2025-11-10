import React from "react";
import "./SonicTextArea.css";
import SonicInputLabel from "../InputLabel/SonicInputLabel";
import SonicInputError from "../InputError/SonicInputError";

const SonicTextArea = ({
  field,
  label = "",
  form,
  id,
  className = "",
  rows = 5,
  showError = true,
  ...props
}) => {
  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Only trim if value is a string
    if (typeof value === "string") {
      form?.setFieldValue?.(name, value.trim());
    }

    // Also mark field as touched
    form?.setFieldTouched?.(name, true);
  };
  return (
    <React.Fragment>
      <div className={`ss_textarea_container`}>
        {!!label && <SonicInputLabel htmlFor={id}>{label}</SonicInputLabel>}
        <div className={`ss_textarea_wrapper`}>
          <textarea
            type="text"
            id={id}
            {...field}
            {...props}
            onBlur={handleBlur}
            rows={rows}
            className={`ss_textarea ${className}`}
          />
        </div>
      </div>

      {showError &&
        form?.touched?.[field?.name] &&
        form?.errors?.[field?.name] && (
          <SonicInputError>{form?.errors[field?.name]}</SonicInputError>
        )}
    </React.Fragment>
  );
};

export default SonicTextArea;
