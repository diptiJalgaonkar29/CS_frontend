import { Field } from "formik";
import TextAreaWrapper from "../../../../../branding/componentWrapper/TextAreaWrapper";
import InputWrapper from "../../../../../branding/componentWrapper/InputWrapper";

export default function TextAreaField({ name, label, placeholder, rows = 3, disabled }) {
  return (
    <div className="field-container" style={{
      pointerEvents: name === "yourPrompt" && disabled ? "none" : undefined,
      opacity: name === "yourPrompt" && disabled ? 0.5 : 1
    }}>
      <Field
        as="textarea"
        id={name}
        name={name}
        placeholder={placeholder}
        label={label}
        rows={rows}
        component={rows === 1 ? InputWrapper : TextAreaWrapper}
      />
    </div>
  );
}
