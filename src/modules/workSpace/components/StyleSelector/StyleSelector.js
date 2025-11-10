import {
  getGenreTagMeta,
  getTagMeta,
} from "../../helperFunctions/getBrandTagMeta";
import "./StyleSelector.css";

const getDisableStyle = (array, value) => {
  if (array?.length) {
    return {
      display: array?.includes(value) ? "flex" : "none",
    };
  } else {
    return {};
  }
};

export const StyleSelector = ({
  title,
  tagType,
  options = [],
  activeOptions = [],
  selectedOption,
  onSelect,
}) => {
  // console.log("tagType******************", tagType);
  // console.log("options", options);
  // console.log("activeOptions", activeOptions);
  // console.log("selectedOption", selectedOption);
  return (
    <div className="style-selector">
      <h2 className="style-selector__title">{title}</h2>
      <div className="style-selector__options">
        {options.map((option) => (
          <button
            key={option.label}
            className={`style-selector__button ${
              selectedOption === option.label
                ? "style-selector__button--selected"
                : ""
            } `}
            style={getDisableStyle(activeOptions, option?.label)}
            onClick={() => onSelect(option)}
          >
            {getTagMeta(option?.label, tagType)?.label || option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
