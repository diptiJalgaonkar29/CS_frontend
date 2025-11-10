import { brandConstants } from "../../../utils/brandConstants";
import getBrandName from "../../../utils/getBrandName";
import getSuperBrandName from "../../../utils/getSuperBrandName";

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

const getVoiceFilterOptionSelectStyle = (isSelected, config) => ({
  container: (provided, styles) => ({
    ...provided,
    width: "125px",
    border: `1px solid ${
      isSelected ? "var(--color-primary)" : "var(--color-white)"
    }`,
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "25px",
    "@media only screen and (max-width: 1350px)": {
      ...styles["@media only screen and (max-width: 1350px)"],
      width: "110px !important",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted var(--color-secondary)",
    padding: "5px 10px",
    fontSize: "16px",
    cursor: "pointer",
    color: window.globalConfig?.IS_SHELL_BRAND
      ? "var(--color-white)"
      : state.isSelected
      ? "var(--color-primary)"
      : "var(--color-white)",
    backgroundColor: window.globalConfig?.IS_SHELL_BRAND
      ? state.isSelected
        ? "var(--color-primary)"
        : "transparent"
      : "transparent",
    ":hover": {
      color: window.globalConfig?.IS_SHELL_BRAND
        ? "var(--color-white)"
        : "var(--color-primary)",
      backgroundColor: window.globalConfig?.IS_SHELL_BRAND
        ? "var(--color-primary)"
        : "transparent",
    },
    ":active": {
      color: window.globalConfig?.IS_SHELL_BRAND
        ? "var(--color-white)"
        : "var(--color-primary)",
      backgroundColor: window.globalConfig?.IS_SHELL_BRAND
        ? "var(--color-primary)"
        : "transparent",
    },
  }),
  valueContainer: (provided, { isDisabled }) => ({
    ...provided,
    color: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
  }),
  control: (provided, styles) => ({
    ...provided,
    fontSize: "16px !important",
    height: "38px !important",
    background: "transparent",
    color: "var(--color-white)",
    border: "none",
    outline: "none",
    boxShadow: "none",
    minHeight: "35px !important",
    width: "100%",
  }),
  singleValue: (provided, { isDisabled }) => ({
    ...provided,
    color: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
    fontSize: "16px",
  }),
  dropdownIndicator: (provided, { isDisabled }) => ({
    ...provided,
    transition: "all .2s ease",
    svg: {
      fill: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
    },
  }),
  placeholder: (provided, { isDisabled }) => ({
    ...provided,
    color: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
    lineHeight: "15px",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    width: "0",
  }),
  input: (provided, styles) => ({
    ...provided,
    color: "var(--color-white)",
    fontSize: "16px",
  }),
  menu: (provided, state) => ({
    ...provided,
    borderBottom: "1px solid var(--color-secondary)",
    background: "var(--color-secondary)",
    border: "1px solid var(--color-white)",
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
  }),
  menuList: (base) => ({
    ...base,
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
    "::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "var(--color-bg)",
      border: "1px solid var(--color-white)",
      borderRadius: window.globalConfig?.IS_WPP_BRAND
        ? "var(--wpp-border-radius-m)"
        : "18px",
    },
    "::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
      borderRadius: window.globalConfig?.IS_WPP_BRAND
        ? "var(--wpp-border-radius-m)"
        : "18px",
    },
    "::-webkit-scrollbar-thumb": {
      background: "var(--color-primary)",
      borderRadius: window.globalConfig?.IS_WPP_BRAND
        ? "var(--wpp-border-radius-m)"
        : "18px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "var(--color-primary)",
    },
  }),
});

export default getVoiceFilterOptionSelectStyle;
