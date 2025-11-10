import React, { useId } from "react";
import "./SonicRadio.css";
// import { uuidv4 } from "@wppopen/components-library";

const SonicRadio = (props) => {
  const { field, id, className = "", label = "", ...rest } = props;
  const inputId = useId();
  return (
    <div className="SonicRadio_container">
      <input
        {...field}
        {...rest}
        id={inputId}
        type="radio"
        className={`${className}`}
      />
      {!!label && <label htmlFor={inputId}>{label}</label>}
    </div>
  );
};
export default SonicRadio;
