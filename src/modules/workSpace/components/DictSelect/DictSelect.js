import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useConfig } from "../../../../customHooks/useConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_DICT_META,
  UPDATE_DICT_DATA,
  UPDATE_INSERT_DICT_DATA,
} from "../../redux/dictionarySlice";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import _ from "lodash";
import capitalizeFirstLetter from "../../../../utils/capitalizeFirstLetter";
import { brandConstants } from "../../../../utils/brandConstants";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
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
  control: (provided, styles) => ({
    ...provided,
    fontSize: "16px !important",
    // height: "35px !important",
    background: "var(--color-secondary)",
    color: "var(--color-white)",
    border: "1px solid var(--color-white)",
    outline: "none",
    boxShadow: "none",
    minHeight: "35px !important",
    width: "200px",
    // width: "150px",
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
    // color: "var(--color-white)",
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
    maxHeight: "100px",
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

const DictSelect = ({
  isDisabled,
  id,
  label = "",
  defaultValue = { label: "", value: "" },
  labelKey = "",
  valueKey = "",
  type,
  placeholder,
  selectedLanguage,
  selectedAccent,
}) => {
  let { config } = useConfig();
  const [optionArray, setOptionArray] = useState([]);
  const dispatch = useDispatch();
  // const { dictFilteredVoiceList } = useSelector((state) => state?.dictionary);
  const { voicesList } = useSelector((state) => state?.voicesList);
  const [filteredVoiceList, setFilteredVoiceList] = useState([]);

  useEffect(() => {
    if (
      (filteredVoiceList.length !== 0 || !isDisabled) &&
      !id?.startsWith("status-")
    ) {
      getOptionsArray(filteredVoiceList, labelKey, valueKey);
    }
  }, [filteredVoiceList?.length]);

  useEffect(() => {
    if (!isDisabled && id?.startsWith("status-")) {
      setOptionArray([
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ]);
    }
  }, [isDisabled, id]);

  useEffect(() => {
    let language =
      (selectedLanguage?.label !== "All" ? selectedLanguage?.label : "") || "";
    let accent =
      (selectedAccent?.label !== "All" ? selectedAccent?.label : "") || "";
    if (language === "All") {
      dispatch(SET_DICT_META({ filteredVoiceList: voicesList }));
      return;
    }
    // console.log("language78787", language);
    // console.log("accent78787", accent);
    // console.log("voicesList78787", voicesList);
    var filteredVoiceData =
      voicesList?.filter((voice) => {
        return (
          (language === ""
            ? voice[KEY_REF["language"]]
                ?.toLowerCase()
                ?.includes(language?.toLowerCase())
            : voice[KEY_REF["language"]]?.toLowerCase() ===
              language?.toLowerCase()) &&
          (accent === ""
            ? voice[KEY_REF["accent"]]
                ?.toLowerCase()
                ?.includes(accent?.toLowerCase())
            : voice[KEY_REF["accent"]]?.toLowerCase() === accent?.toLowerCase())
        );
      }) || [];
    // console.log("filteredVoiceData78787", filteredVoiceData);
    // dispatch(SET_DICT_META({ filteredVoiceList: filteredVoiceData }));
    setFilteredVoiceList(filteredVoiceData);
  }, [selectedLanguage?.label, selectedAccent?.label, voicesList.length]);

  const getOptionsArray = (voiceData, labelKey, valueKey) => {
    const arrayUniqueByKey = _.uniqBy(
      [
        ...new Map(voiceData.map((item) => [item[labelKey], item])).values(),
      ]?.map((value) => {
        return {
          label: capitalizeFirstLetter(value[labelKey]),
          value: value[valueKey],
        };
      }),
      (v) => [v?.label || "", v?.value || ""].join()
    );
    let sortedArrayUniqueByKey = _.sortBy(arrayUniqueByKey, "label");
    sortedArrayUniqueByKey.unshift({ value: "", label: "All" });
    setOptionArray(sortedArrayUniqueByKey);
  };

  const handleChange = (value) => {
    if (type === "INSERT") {
      dispatch(UPDATE_INSERT_DICT_DATA({ id, value }));
    } else {
      dispatch(UPDATE_DICT_DATA({ id, value: JSON.stringify(value) }));
    }
  };

  return (
    <div className="dict_input_wrapper">
      {label !== "" && <div className="ogWord_header">{label}</div>}
      <Select
        // menuIsOpen={true}
        placeholder={placeholder}
        onChange={(value) => {
          handleChange(value);
        }}
        id={id}
        options={optionArray}
        isDisabled={isDisabled}
        value={defaultValue || null}
        styles={customStyles}
      />
    </div>
  );
};

export default DictSelect;
