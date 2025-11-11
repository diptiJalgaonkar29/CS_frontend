import { Field, useFormikContext } from "formik";
import CheckboxWrapper from "../../../../../branding/componentWrapper/CheckboxWrapper";
import "./CheckboxGroup.css";
import { useSelector } from "react-redux";

export default function CheckboxGroup({ name, label, options }) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext();
  const { videoFile, briefFile, yourPrompt } = values;
  const { aiMusicGeneratorProgress } = useSelector((state) => state.AIMusic);

  const isDisabled = (id) => {
    if (id === "video") return !videoFile;
    if (id === "brief") return !briefFile;
    if (id === "prompt") return !yourPrompt;
    return false;
  };

  const enabledOptions = options.filter(
    (opt) => opt.id !== "all" && !isDisabled(opt.id)
  );

  const isAllDisabled = enabledOptions.length === 0;

  const handleChange = (e, id) => {
    const selected = values[name] || [];
    let newSelected = [];

    if (id === "all") {
      if (selected.includes("all")) {
        // Uncheck all
        newSelected = [];
      } else {
        // Select only enabled options + "all"
        newSelected = enabledOptions.map((opt) => opt.id).concat("all");
      }
    } else {
      if (selected.includes(id)) {
        // Unselect individual option
        newSelected = selected.filter((val) => val !== id && val !== "all");
      } else {
        // Add this option
        newSelected = [...selected, id];

        const allEnabledIds = enabledOptions.map((opt) => opt.id);
        const isAllNowSelected = allEnabledIds.every((optId) =>
          newSelected.includes(optId)
        );

        if (isAllNowSelected) {
          newSelected.push("all");
        } else {
          newSelected = newSelected.filter((val) => val !== "all");
        }
      }
    }

    setFieldValue(name, newSelected);
    setFieldTouched(name, true);
  };

  const isAnySelected = (values[name] || []).length > 0;

  return (
    <div className="fieldContainer">
      <p className="SonicInputLabel">{label}</p>
      <div className="checkboxGrid">
        {options.map((option) => {
          const disabled =
            option.id === "all"
              ? enabledOptions.length === 0
              : isDisabled(option.id) ||
                (isAnySelected && !values[name]?.includes(option.id));
          return (
            <label
              key={option.id}
              className={`checkbox-label ${
                disabled ? "checkbox-disabled" : ""
              }`}
            >
              <Field
                type="checkbox"
                name={name}
                value={option.id}
                label={option.label}
                component={CheckboxWrapper}
                checked={values[name]?.includes(option.id)}
                onChange={(e) => handleChange(e, option.id)}
                disabled={disabled || aiMusicGeneratorProgress?.id}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
