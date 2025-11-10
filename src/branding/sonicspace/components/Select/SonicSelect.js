import React, { useState } from "react";
import Select from "react-select";
import "./SonicSelect.css";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import { brandConstants } from "../../../../utils/brandConstants";
import getBrandName from "../../../../utils/getBrandName";

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

const customStyles = {
  container: (provided) => ({
    ...provided,
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
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
    padding: "4px 8px",
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
  }),
  control: (provided) => ({
    ...provided,
    borderRadius: 25,
    fontSize: "16px !important",
    height: "47px !important",
    background: "var(--color-bg)",
    color: "var(--color-white)",
    border: "1px solid var(--color-white)",
    outline: "none",
    boxShadow: "none",
    minHeight: "47px !important",
    width: "100%",
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
    margin: "5px",
    "@media only screen and (max-width: 1100px)": {
      ...styles["@media only screen and (max-width: 1100px)"],
      width: "125px !important",
    },
    "&:hover": {
      border: "1px solid var(--color-white)",
    },
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
    fontSize: "16px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    transition: "all .2s ease",
    svg: {
      fill: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
    },
  }),
  placeholder: (provided, { isDisabled }) => ({
    ...provided,
    color: isDisabled ? "var(--color-icon-inactive)" : "var(--color-white)",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    width: "0",
  }),
  input: (provided, styles) => ({
    ...provided,
    color: "var(--color-white)",
    fontSize: "16px",
    "@media only screen and (max-width: 950px)": {
      ...styles["@media only screen and (max-width: 950px)"],
      margin: "13px !important",
    },
  }),
  menu: (provided, state) => ({
    ...provided,
    borderBottom: "1px solid var(--color-secondary)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-white)",
    borderRadius: "15px",
    borderRadius: window.globalConfig?.IS_WPP_BRAND
      ? "var(--wpp-border-radius-m)"
      : "10px",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "175px",
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
};

const SonicSelect = ({ field, form: { setFieldValue }, ...props }) => {
  const [selectedItem, setSelectedItem] = useState(
    field?.value
      ? {
          label: field?.value,
          value: field?.value,
        }
      : null
  );
  return (
    <div className={`ss_select_container`}>
      <Select
        {...field}
        {...props}
        onChange={(value) => {
          setSelectedItem(value);
          setFieldValue(field.name, value?.label);
        }}
        value={selectedItem}
        styles={customStyles}
      />
    </div>
  );
};

export default SonicSelect;
