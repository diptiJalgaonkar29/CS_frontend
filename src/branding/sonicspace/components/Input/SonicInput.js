import React from "react";
import "./SonicInput.css";
import SonicInputLabel from "../InputLabel/SonicInputLabel";
import SonicInputError from "../InputError/SonicInputError";

const SonicInput = ({
  field,
  label = "",
  size = "m",
  form,
  id,
  className = "",
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
      <div className={`ss_input_container`}>
        {!!label && <SonicInputLabel htmlFor={id}>{label}</SonicInputLabel>}
        <input
          type="text"
          id={id}
          {...field}
          {...props}
          onBlur={handleBlur}
          className={`ss_input ${size} ${className} ${
            form?.touched?.[field?.name] && form?.errors?.[field?.name]
              ? "invalid"
              : ""
          }`}
        />
        {showError &&
          form?.touched?.[field?.name] &&
          form?.errors?.[field?.name] && (
            <SonicInputError style={{ marginTop: 0 }}>
              {form?.errors[field?.name]}
            </SonicInputError>
          )}
      </div>
    </React.Fragment>
  );
};

export default SonicInput;
