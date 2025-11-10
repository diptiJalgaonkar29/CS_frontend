import React, { useEffect } from "react";
import "./SonicFileInput.css";
import { ReactComponent as UploadIcon } from "../../../../static/common/upload.svg";
import { ReactComponent as CloseIcon } from "../../../../static/common/close.svg";

const SonicFileInput = ({
  field: { value, name, ...restFields },
  id,
  variant = "filled",
  form: { setFieldValue, values, errors, setErrors },
  ...props
}) => {
  const removeBugFile = () => {
    let sonic_file_input = document.getElementById("sonic_file_input");
    sonic_file_input.value = null;
    setFieldValue(name, null);
    props.onRemove?.();
  };

  return (
    <React.Fragment>
      <div className={`sonic_file_input_container ${variant}`}>
        <label className="label" htmlFor="sonic_file_input">
          <UploadIcon className="logo" height={20} width={20} />
          {values?.[name]?.name
            ? `Your file is selected ( ${
                values?.[name]?.name
                  ? values?.[name]?.name.slice(0, 25) + "..."
                  : ""
              })`
            : props.placeholder}
        </label>
        {values?.[name]?.name && (
          <button id="remove_sonic_file" onClick={removeBugFile}>
            <CloseIcon />
          </button>
        )}
        <input
          id={`sonic_file_input`}
          name={name}
          {...restFields}
          {...props}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            setFieldValue(name, file || null);
            setErrors(name, null);
            props.onChange?.(event);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default SonicFileInput;
