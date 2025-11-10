import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import "./VoicesFilterOption.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import { FormattedMessage } from "react-intl";
import { last } from "lodash";
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import InfoToolTip from "../InfoToolTip/InfoToolTip";

const VoicesFilterOption = (props) => {
  const [languageArray, setLanguageArray] = useState([]);
  const [accentArray, setAccentArray] = useState([]);
  const [tagArray, setTagArray] = useState([]);
  const [industryArray, setIndustryArray] = useState([]);
  const [AgeArray, setAgeArray] = useState([]);
  const [genderArray, setGenderArray] = useState([]);

  const [selectedLanguage, setSelectedLanguage] = useState([]);
  const [selectedAccent, setSelectedAccent] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedAge, setSelectedAge] = useState([]);
  const [selectedStudioQuality, setSelectedStudioQuality] = useState(false);
  const [selectedMultiExpressive, setSelectedMultiExpressive] = useState(false);
  // const [selectedProfessional, setSelectedProfessional] = useState(false);
  const [selectedVoiceOptionList, setSelectedVoiceOptionList] = useState([
    { value: "All", label: "All Voices" },
  ]);
  const [searchedVoice, setSearchedVoice] = useState("");

  useEffect(() => {
    getLanguages(props.filteredData);
    getAccent(props.filteredData);
    getAge(props.filteredData);
    getGender(props.filteredData);
    // getTags(props.filteredData);
    getIndustryExamples(props.filteredData);
  }, [props?.filteredData?.length]);

  //as per Voicedata filterd changed --date:-04/04/2025
  // useEffect(() => {
  //   getLanguages(props.voiceData);
  //   getAccent(props.voiceData);
  //   getAge(props.voiceData);
  //   getGender(props.voiceData);
  //   // getTags(props.voiceData);
  //   getIndustryExamples(props.voiceData);
  // }, [props?.voiceData?.length]);

  useEffect(() => {
    props?.getTTSVoicesData?.({
      language: selectedLanguage,
      accent: selectedAccent,
      tag: selectedTag,
      industry: selectedIndustry,
      gender: selectedGender,
      age: selectedAge,
      artistName: searchedVoice,
      voiceOptionList: selectedVoiceOptionList,
      isStudioQuality: selectedStudioQuality,
      isMultiExpressive: selectedMultiExpressive,
      // isProfessional: selectedProfessional,
    });
  }, [
    JSON.stringify(selectedVoiceOptionList),
    JSON.stringify(selectedLanguage),
    JSON.stringify(selectedAccent),
    JSON.stringify(selectedGender),
    JSON.stringify(selectedAge),
    JSON.stringify(selectedTag),
    JSON.stringify(selectedIndustry),
    searchedVoice,
    selectedStudioQuality,
    selectedMultiExpressive,
    // selectedProfessional,
  ]);

  let savedRecentOptionList = [
    { value: "All", label: "All Voices" },
    ...(props?.voiceData?.some((item) => item?.isOnBrand === 1)
      ? [{ value: "OnBrand", label: "On-brand" }]
      : []),
    { value: "Popular", label: "Popular" },
    { value: "Recent", label: "Recently used" },
    { value: "Saved", label: "Saved" },
  ];

  const getLanguages = (voiceData) => {
    var languages = voiceData?.map((value) => value[KEY_REF["language"]]);
    let uniqueLanguages = [...new Set(languages)]?.filter(Boolean)?.sort();
    const uniqueLanguagesObj = uniqueLanguages?.map((lang) => {
      return {
        value: lang,
        label: lang,
      };
    });
    setLanguageArray(uniqueLanguagesObj);
  };

  const getAccent = (voiceData) => {
    var accent = voiceData?.map((value) => value[KEY_REF["accent"]]);
    let uniqueAccent = [...new Set(accent)]?.filter(Boolean)?.sort();
    const uniqueAccentObj = uniqueAccent?.map((acc) => {
      return {
        value: acc,
        label: acc,
      };
    });
    setAccentArray(uniqueAccentObj);
  };

  const getAge = (voiceData) => {
    var ageArr = voiceData?.map((value) => value[KEY_REF["age"]]);
    let uniqueAgeArr = [...new Set(ageArr)]?.filter(Boolean)?.sort();
    const uniqueAgeObj = uniqueAgeArr?.map((lang) => {
      return {
        value: lang,
        label: lang,
      };
    });
    setAgeArray(uniqueAgeObj);
  };

  const getGender = (voiceData) => {
    var genderArr = voiceData?.map((value) => value[KEY_REF["gender"]]);
    let uniqueGenderArr = [...new Set(genderArr)]?.filter(Boolean)?.sort();
    console.log("uniqueGenderArr", uniqueGenderArr);
    const uniqueGenderObj = uniqueGenderArr?.map((lang) => {
      return {
        value: lang,
        label: lang,
      };
    });
    setGenderArray(uniqueGenderObj);
  };

  // const getTags = (voiceData) => {
  //   const tagArr = [];
  //   voiceData?.forEach((value) => {
  //     if (
  //       value?.[KEY_REF["tags"]]?.length != 0 &&
  //       value?.[KEY_REF["tags"]] !== undefined &&
  //       value?.[KEY_REF["tags"]] !== null
  //     ) {
  //       tagArr.push(...value?.[KEY_REF["tags"]]);
  //     }
  //   });
  //   let uniqueTags = [...new Set(tagArr)]?.filter(Boolean)?.sort();
  //   const uniqueTagsObj = uniqueTags
  //     ?.filter(Boolean)
  //     ?.filter((tag) => {
  //       return !tag.includes(".");
  //     })
  //     .map((tag) => {
  //       return {
  //         value: tag,
  //         label: (tag),
  //       };
  //     });

  //   setTagArray(uniqueTagsObj);
  // };

  const getIndustryExamples = (voiceData) => {
    const industryArr = [];
    voiceData?.forEach((value) => {
      if (
        value?.[KEY_REF["speakingStyles"]]?.length != 0 &&
        value?.[KEY_REF["speakingStyles"]] !== undefined &&
        value?.[KEY_REF["speakingStyles"]] !== null
      ) {
        industryArr.push(...value?.[KEY_REF["speakingStyles"]]);
      }
    });

    let uniqueIndustry = [...new Set(industryArr)]?.filter(Boolean)?.sort();
    const uniqueIndustryObj = uniqueIndustry
      ?.filter((Industry) => {
        return Industry !== "";
      })
      ?.filter((Industry) => {
        return !Industry.includes(".");
      })
      .map((Industry) => {
        return {
          value: Industry,
          label: Industry,
        };
      });
    setIndustryArray(uniqueIndustryObj);
  };

  const handleChangeLanguage = (value) => {
    setSelectedLanguage(value);
  };

  const handleChangeAccent = (value) => {
    setSelectedAccent(value);
  };

  const handleChangeTag = (value) => {
    setSelectedTag(value);
  };

  const handleChangeIndustry = (value) => {
    setSelectedIndustry(value);
  };

  const handleChangeGender = (value) => {
    setSelectedGender(value);
  };

  const handleChangeAge = (value) => {
    setSelectedAge(value);
  };

  const handleChangeVoiceOptionList = (value) => {
    setSelectedVoiceOptionList(last(value) ? [last(value)] : []);
  };

  const handleChangeReset = () => {
    setSelectedLanguage([]);
    setSelectedAccent([]);
    setSelectedTag([]);
    setSelectedIndustry([]);
    setSelectedGender([]);
    setSelectedAge([]);
    setSearchedVoice("");
    setSelectedVoiceOptionList([]);
    setSelectedStudioQuality(false);
    setSelectedMultiExpressive(false);
    // setSelectedProfessional(false);
  };

  const voiceFilterSelectOptionArr = [
    {
      id: "voiceOptions",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.allVoicesPlaceHolder" />
      ),
      onChange: handleChangeVoiceOptionList,
      value: selectedVoiceOptionList,
      options: savedRecentOptionList,
      disableSearch: true,
      hasSelectAll: false,
    },
    {
      id: "gender",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.genderPlaceHolder" />
      ),
      onChange: handleChangeGender,
      value: selectedGender,
      options: genderArray,
      disableSearch: true,
      hasSelectAll: true,
    },
    {
      id: "age",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.agePlaceHolder" />
      ),
      onChange: handleChangeAge,
      value: selectedAge,
      options: AgeArray,
      disableSearch: true,
      hasSelectAll: true,
    },
    {
      id: "language",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.languagePlaceHolder" />
      ),
      onChange: handleChangeLanguage,
      value: selectedLanguage,
      options: languageArray,
      disableSearch: false,
      hasSelectAll: true,
    },
    {
      id: "accent",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.accentPlaceHolder" />
      ),
      onChange: handleChangeAccent,
      value: selectedAccent,
      options: accentArray,
      disableSearch: false,
      hasSelectAll: true,
    },
    {
      id: "industry",
      placeholder: (
        <FormattedMessage id="workspace.voiceTab.selectVoice.speakingStylePlaceHolder" />
      ),
      onChange: handleChangeIndustry,
      value: selectedIndustry,
      options: industryArray,
      disableSearch: false,
      hasSelectAll: true,
    },
    // {
    // id:"tag",
    //   placeholder: (
    //     <FormattedMessage id="workspace.voiceTab.selectVoice.tagPlaceHolder" />
    //   ),
    //   onChange: handleChangeTag,
    //   value: selectedTag,
    //   options: tagArray,
    //   disableSearch: false,
    //   hasSelectAll: true,
    // },
  ];

  return (
    <>
      <div className="voice-form-container" id="voice-form-container">
        <div className="left_VoicesFilterOption_container">
          {voiceFilterSelectOptionArr.map((select, index) => {
            return (
              <MultiSelect
                key={`voices_filter_option-${index}`}
                options={select.options}
                value={select.value}
                onChange={select.onChange}
                disableSearch={select.disableSearch}
                hasSelectAll={select.hasSelectAll}
                labelledBy="Select"
                className={`multi_select_voice_filter ${select.id} ${
                  select.hasSelectAll ? "selectAll" : ""
                }`}
                overrideStrings={{
                  selectSomeItems: select.placeholder,
                  allItemsAreSelected: select.placeholder,
                  selectAll: "Select all",
                }}
                // commented for selected for option 23/04/2025
                // overrideStrings={{
                //   selectSomeItems:
                //     select.value && select.value.length > 0
                //       ? select.value.map((item) => item.label).join(", ")
                //       : select.placeholder,
                //   allItemsAreSelected:
                //     select.value && select.value.length > 0
                //       ? select.value.map((item) => item.label).join(", ")
                //       : select.placeholder,
                //   selectAll: "Select all",
                // }}
                // isOpen
              />
            );
          })}
        </div>
        <div className="right_VoicesFilterOption_container">
          <input
            type="text"
            name="Voice search"
            className="search_voice_input"
            placeholder="Voice search"
            style={{
              borderColor: searchedVoice
                ? "var(--color-primary)"
                : "var(--color-white)",
            }}
            onChange={(e) => {
              setSearchedVoice(e.target.value);
            }}
            value={searchedVoice}
          />
          <IconWrapper icon="Search" className="search_icon" />
        </div>
      </div>
      <div className="bottom_voice_filter">
        <div className="bottom_left_voice_filter">
          <div className="Studio_Quality_InfoToolTip">
            <CheckboxWrapper
              label="Studio Quality"
              checked={selectedStudioQuality}
              onChange={(e) => setSelectedStudioQuality(e.target.checked)}
            />
            <InfoToolTip>
              <div className="VoicesFilter_tooltip_container">
                <IconWrapper icon="Mic" />
                <p>
                  High quality, professionally made voices. The tone is set and
                  can't be changed, keeps a clear, unalterable tone that
                  maintains its integrity, stability, and consistency.
                </p>
              </div>
            </InfoToolTip>
          </div>
          <div className="Studio_Quality_InfoToolTip">
            <CheckboxWrapper
              label="Multi-expressive"
              checked={selectedMultiExpressive}
              onChange={(e) => setSelectedMultiExpressive(e.target.checked)}
            />
            <InfoToolTip>
              <div className="VoicesFilter_tooltip_container">
                <IconWrapper icon="Masks" />
                <p>
                  These voices offer a more basic level of audio quality, but
                  they provide the flexibility to modify emotional tone and
                  expression. i.e. sad, happy, angry tone.
                </p>
              </div>
            </InfoToolTip>
          </div>
          {/* <div className="Studio_Quality_InfoToolTip">
            <CheckboxWrapper
              label="Professional"
              checked={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.checked)}
            />
            <InfoToolTip>
              <div className="VoicesFilter_tooltip_container">
                <IconWrapper icon="Voice" />
                <p>
                  Clear, articulate, and well-paced voices suitable for business
                  and formal settings. Maintains a neutral, authoritative tone
                  that ensures clarity, reliability, and a polished delivery
                  throughout. Designed for consistency and effective
                  communication in professional environments.
                </p>
              </div>
            </InfoToolTip>
          </div> */}
        </div>
        <div className="bottom_right_voice_filter">
          <p onClick={handleChangeReset} className="reset_btn highlight_text">
            Reset filters
          </p>
        </div>
      </div>
    </>
  );
};

export default VoicesFilterOption;