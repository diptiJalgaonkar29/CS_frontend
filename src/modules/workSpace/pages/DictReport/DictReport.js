import React, { useEffect, useState } from "react";
import DictSelect from "../../components/DictSelect/DictSelect";
import "./DictReport.css";
import { ReactComponent as Delete } from "../../../../static/common/delete.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  DELETE_DICT_DATA,
  SET_DICT_DATA,
  SET_DICT_META,
  UPDATE_DICT_DATA,
} from "../../redux/dictionarySlice";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import { SET_VOICE_META } from "../../redux/voicesSlice";
import TTSCustomInput from "../../components/TTSCustomInput/TTSCustomInput";
import DictCell from "../../components/DictCell/DictCell";
import wordCapitalizer from "../../../../utils/wordCapitalizer";
import isJsonString from "../../../../utils/isJsonString";
import getDictionaryMeta from "../../services/DictionaryDB/getDictionaryMeta";
import updateDictionaryMeta from "../../services/DictionaryDB/updateDictionaryMeta";
import deleteDictionaryMeta from "../../services/DictionaryDB/deleteDictionaryMeta";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import {
  ADD_VOICES_LIST,
  SET_VOICE_LIST_META,
} from "../../redux/voicesListSlice";
import getTTSVoicesV2 from "../../services/voiceExternal/getTTSVoicesV2";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import syncDataToVoicebox from "../../services/voiceExternal/syncDataToVoicebox";
import useTTSSampleVoicePlayPause from "../../../../customHooks/useTTSSampleVoicePlayPause";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { useConfig } from "../../../../customHooks/useConfig";
import Layout from "../../../../common/components/layout/Layout";
import BackButton from "../../../../common/components/backButton/BackButton";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useNavigate } from "react-router-dom";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import { use } from "react";

const reqiredVoiceData = (arr1, arr2, filterBy) => {
  let res = [];
  res = arr1?.filter((el) => {
    return arr2?.find((element) => {
      return element === el[filterBy];
    });
  });
  return res;
};

const DictReport = () => {
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const { dictData } = useSelector((state) => state.dictionary);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authMeta } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const { voicesList, isVoicesListFetching } = useSelector(
    (state) => state?.voicesList
  );
  let { jsonConfig } = useConfig();
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // const getAllDictData = () => {
  //   setIsLoading(true);
  //   getDictionaryMeta({
  //     onSuccess: (response) => {
  //       // console.log("response", response);
  //       // dispatch(SET_DICT_DATA(response?.data || []));
  //       // setIsLoading(false);
  //       let allData = response?.data || [];
  //       console.log("allData sample item:", allData[0]); // check data here too

  //       const filtered = selectedBrandId
  //         ? allData.filter(
  //             (item) => String(item.sub_brand_id) === selectedBrandId
  //           )
  //         : allData;

  //       dispatch(SET_DICT_DATA(filtered));
  //       getBrandOptions(filtered);
  //       setIsLoading(false);
  //     },
  //     onError: () => setIsLoading(false),
  //   });
  // };

  const [rawDictData, setRawDictData] = useState([]);

  const getAllDictData = () => {
    setIsLoading(true);
    getDictionaryMeta({
      onSuccess: (response) => {
        const allData = response?.data || [];
        setRawDictData(allData); // store unfiltered data
        applyBrandFilter(allData, selectedBrandId); // apply filter once
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  const applyBrandFilter = (allData, brandId) => {
    const filtered = brandId
      ? allData.filter((item) => String(item.sub_brand_id) === brandId)
      : allData;
    dispatch(SET_DICT_DATA(filtered));
  };

  useEffect(() => {
    applyBrandFilter(rawDictData, selectedBrandId); // no API call here
  }, [selectedBrandId]);

  // const getBrandOptions = () => {
  //   axiosSSPrivateInstance
  //     .get("/brand")
  //     .then((response) => {
  //       if (response.status === 200) {
  //         const brandOptions = response.data.map((brand) => ({
  //           value: brand.id,
  //           label: brand.brandName,
  //         }));
  //         setBrandOptions(brandOptions);
  //         console.log("brandOptions", brandOptions);
  //         return brandOptions;
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching brand options:", error);
  //     });
  // };

  const fetchBrandOptions = async () => {
    try {
      const res = await axiosSSPrivateInstance.get("/brand");
      if (res.status === 200) {
        const allBrands = res.data.map((brand) => ({
          value: String(brand.id),
          label: brand.brandName,
        }));
        setBrandOptions(allBrands); // All brands shown regardless of dict data
      }
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  useEffect(() => {
    fetchBrandOptions();
  }, []);

  // const getBrandOptions = (dictData = []) => {
  //   console.log("dictData sample item:", dictData[0]);

  //   const usedBrandIds = [
  //     ...new Set(dictData.map((item) => item.sub_brand_id)),
  //   ];
  //   console.log("usedBrandIds", usedBrandIds);

  //   axiosSSPrivateInstance
  //     .get("/brand")
  //     .then((response) => {
  //       if (response.status === 200) {
  //         const filteredBrandOptions = response.data
  //           .filter((brand) => usedBrandIds.includes(brand.id))
  //           .map((brand) => ({
  //             value: brand.id,
  //             label: brand.brandName,
  //           }));

  //         setBrandOptions(filteredBrandOptions);
  //         console.log("Filtered brand options:", filteredBrandOptions);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching brand options:", error);
  //     });
  // };

  useEffect(() => {
    const { authMeta } = getCSUserMeta();
    const accessibleRoles = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"];
    if (!accessibleRoles.includes(authMeta?.userRole)) {
      return navigate(NavStrings.HOME);
    }
    getAllDictData();
    // getBrandOptions();
    if (voicesList.length === 0) {
      if (!isVoicesListFetching) {
        getTTSVoicesDataAPI();
      }
    } else {
      dispatch(
        SET_DICT_META({
          dictFilteredVoiceList: voicesList,
        })
      );
    }
  }, [selectedBrandId]);

  const getTTSVoicesDataAPI = () => {
    dispatch(
      SET_VOICE_LIST_META({
        isVoicesListFetching: true,
      })
    );
    getTTSVoicesV2({
      onSuccess: async (response) => {
        let responseVoiceJson = response?.data?.voiceData || [];
        var reqiredVoiceDataArr = [];
        if (jsonConfig?.TTS_VOICE_ARTISTS?.length !== 0) {
          reqiredVoiceDataArr = reqiredVoiceData(
            responseVoiceJson,
            jsonConfig?.TTS_VOICE_ARTISTS,
            KEY_REF["artistName"]
          );
        } else if (jsonConfig?.TTS_VOICE_LANGUAGE?.length !== 0) {
          reqiredVoiceDataArr = reqiredVoiceData(
            responseVoiceJson,
            jsonConfig?.TTS_VOICE_LANGUAGE,
            KEY_REF["language"]
          );
        } else {
          reqiredVoiceDataArr = responseVoiceJson;
        }
        dispatch(
          SET_VOICE_LIST_META({
            voicesList: reqiredVoiceDataArr,
            isVoicesListFetching: false,
          })
        );
        dispatch(
          SET_DICT_META({
            dictFilteredVoiceList: reqiredVoiceDataArr,
          })
        );
      },
      onError: () => {
        dispatch(ADD_VOICES_LIST([]));
        dispatch(
          SET_VOICE_LIST_META({
            isVoicesListFetching: false,
          })
        );
      },
    });
  };

  const updateDataInDB = (data) => {
    let dictMeta = {
      id: data.id,
      originalWord: data?.original_word,
      formattedWord: data?.formatted_word,
      language: data?.language,
      accent: data?.accent,
      voice: data?.voice,
      status: data?.status,
    };
    updateDictionaryMeta({
      dictMeta,
      onSuccess: () => {
        dispatch(
          UPDATE_DICT_DATA({
            id: `full_name-${data?.id}`,
            value: wordCapitalizer(authMeta?.fullName),
          })
        );
        getAllDictData();
        setIsLoading(false);
        setSelectedEditRecord(null);
      },
      onError: () => {
        setIsLoading(false);
        setSelectedEditRecord(null);
      },
    });
  };

  const updateRow = (data) => {
    setIsLoading(true);
    let languageObj = isJsonString(data?.language)
      ? JSON.parse(data?.language)
      : "";
    let accentObj = isJsonString(data?.accent) ? JSON.parse(data?.accent) : "";
    let voiceObj = isJsonString(data?.voice) ? JSON.parse(data?.voice) : "";
    let statusObj = isJsonString(data?.status)
      ? JSON.parse(data?.status)
      : { label: data?.status || "", value: data?.status || "" };

    if (statusObj.value === "approved") {
      let modData = {
        ampvoicelocale: languageObj?.label,
        ampvoicelocaleID: languageObj?.value,
        ampvoiceaccent: accentObj?.label,
        ampvoiceaccentID: accentObj?.value,
        uUID: data?.uuid_pronunciation,
        ampvoiceUUID: voiceObj?.value,
        original_word: data?.original_word,
        revised_word: data?.formatted_word,
        statusId: "1",
        status: statusObj?.value,
        id: data?.id,
      };
      syncDataToVoicebox({
        data: modData,
        onSuccess: () => {
          updateDataInDB({ ...data, status: statusObj?.value });
        },
        onError: (err) => {
          console.log("err", err);
          setIsLoading(false);
        },
      });
    } else if (
      ["rejected", "pending"].includes(statusObj.value) &&
      data?.uuid_pronunciation
    ) {
      let modData = {
        ampvoicelocale: languageObj?.label,
        ampvoicelocaleID: languageObj?.value,
        ampvoiceaccent: accentObj?.label,
        ampvoiceaccentID: accentObj?.value,
        uUID: data?.uuid_pronunciation,
        ampvoiceUUID: voiceObj?.value,
        original_word: data?.original_word,
        revised_word: data?.formatted_word,
        statusId: "0",
        status: statusObj?.value,
        id: data?.id,
      };
      syncDataToVoicebox({
        data: modData,
        onSuccess: () => {
          updateDataInDB({ ...data, status: statusObj?.value });
        },
        onError: (err) => {
          console.log("err", err);
          setIsLoading(false);
        },
      });
    } else {
      updateDataInDB({ ...data, status: statusObj?.value });
    }
  };

  const deleteDataInDB = (data) => {
    dispatch(DELETE_DICT_DATA(data.id));
    deleteDictionaryMeta({
      dictDataID: data.id,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  const deleteRow = (data) => {
    setIsLoading(true);
    if (!!data?.uuid_pronunciation) {
      let languageObj = isJsonString(data?.language)
        ? JSON.parse(data?.language)
        : "";
      let accentObj = isJsonString(data?.accent)
        ? JSON.parse(data?.accent)
        : "";
      let voiceObj = isJsonString(data?.voice) ? JSON.parse(data?.voice) : "";

      let modData = {
        ampvoicelocale: languageObj?.label,
        ampvoicelocaleID: languageObj?.value,
        ampvoiceaccent: accentObj?.label,
        ampvoiceaccentID: accentObj?.value,
        uUID: data?.uuid_pronunciation,
        ampvoiceUUID: voiceObj?.value,
        original_word: data?.original_word,
        revised_word: data?.formatted_word,
        statusId: "0",
        status: data?.status,
        id: data?.id,
      };
      syncDataToVoicebox({
        data: modData,
        onSuccess: () => {
          deleteDataInDB(data);
        },
        onError: (err) => {
          console.log("err", err);
          setIsLoading(false);
        },
      });
    } else {
      deleteDataInDB(data);
    }
  };

  let editedData = dictData?.find(
    (data) => data?.id === selectedEditRecord?.id
  );

  const { audioCommonRef, playingAudio, setPlayingAudio, playPause } =
    useTTSSampleVoicePlayPause();

  return (
    <Layout hideNavLinks={true}>
      <div className="pronunciation_audio_container">
        <audio
          id="pronunciation_audio"
          onError={() => {
            showNotification("ERROR", "Something went wrong!");
            setPlayingAudio((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }}
          controlsList="nodownload noplaybackrate"
          ref={audioCommonRef}
          controls
          onLoadedMetadata={() => {
            setPlayingAudio((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }}
          onEnded={() => {
            setPlayingAudio((prev) => ({
              ...prev,
              isPlaying: false,
            }));
          }}
          onPlay={() => {
            dispatch(
              SET_VOICE_META({
                isTTSVoicePlaying: true,
              })
            );
          }}
          onPause={() => {
            dispatch(
              SET_VOICE_META({
                isTTSVoicePlaying: false,
              })
            );
          }}
        />
      </div>
      {isLoading ? (
        <CustomLoader loaderMsgFor="VOICE" />
      ) : (
        <>
          <div className="dict_report_header">
            <BackButton />
            <h2 className="title">Pronunciation :</h2>
            {authMeta?.userRole === "ROLE_SUPER_ADMIN" && (
              <div className="BrandFilter">
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                >
                  <option value="" disabled>
                    Filter by brands
                  </option>
                  <option value="">All Brands</option>
                  {brandOptions?.map((brand) => (
                    <option key={brand.value} value={brand.value}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {dictData?.length !== 0 ? (
            <div className="dict_report_container">
              <div className="dict_report_data_container">
                <div className="dict_report_data_container_inner">
                  {dictData?.map((data, index) => {
                    return (
                      <div
                        className="dict_report_data_row"
                        key={`dict_report_${data?.id}`}
                      >
                        <TTSCustomInput
                          label={index === 0 ? `User's word*` : ``}
                          defaultValue={data?.original_word}
                          mp3={data?.original_word_url}
                          isDisabled={true}
                          id={`original_word-${data.id}`}
                          selectedLanguage={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : {}
                          }
                          selectedAccent={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : {}
                          }
                          selectedVoice={
                            isJsonString(data?.voice)
                              ? JSON.parse(data?.voice)
                              : {}
                          }
                          playingAudio={playingAudio}
                          playPause={playPause}
                        />
                        <TTSCustomInput
                          label={index === 0 ? `Alternate spelling*` : ``}
                          defaultValue={data?.formatted_word}
                          mp3={data?.formatted_word_url}
                          showCross={true}
                          isDisabled={selectedEditRecord?.id !== data.id}
                          id={`formatted_word-${data.id}`}
                          selectedLanguage={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : {}
                          }
                          selectedAccent={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : {}
                          }
                          selectedVoice={
                            isJsonString(data?.voice)
                              ? JSON.parse(data?.voice)
                              : {}
                          }
                          playingAudio={playingAudio}
                          playPause={playPause}
                        />
                        <DictSelect
                          label={index === 0 ? `Language*` : ``}
                          defaultValue={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : ""
                          }
                          id={`language-${data.id}`}
                          labelKey={KEY_REF["language"]}
                          valueKey={KEY_REF["languageId"]}
                          // isDisabled={selectedEditRecord?.id !== data.id}
                          isDisabled={true}
                          placeholder="Language"
                          selectedLanguage={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : ""
                          }
                          selectedAccent={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : ""
                          }
                        />
                        <DictSelect
                          label={index === 0 ? `Accent*` : ``}
                          defaultValue={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : ""
                          }
                          id={`accent-${data.id}`}
                          labelKey={KEY_REF["accent"]}
                          valueKey={KEY_REF["accentId"]}
                          // isDisabled={
                          //   selectedEditRecord?.id !== data.id ||
                          //   !(isJsonString(data?.language)
                          //     ? JSON.parse(data?.language)?.value
                          //     : "")
                          // }
                          isDisabled={true}
                          placeholder="Accent"
                          selectedLanguage={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : ""
                          }
                          selectedAccent={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : ""
                          }
                        />
                        <DictSelect
                          label={index === 0 ? `Voice*` : ``}
                          defaultValue={
                            isJsonString(data?.voice)
                              ? JSON.parse(data?.voice)
                              : ""
                          }
                          id={`voice-${data.id}`}
                          labelKey={KEY_REF["artistName"]}
                          valueKey={KEY_REF["voiceUUID"]}
                          // isDisabled={
                          //   selectedEditRecord?.id !== data.id ||
                          //   !(isJsonString(data?.accent)
                          //     ? JSON.parse(data?.accent)?.value
                          //     : "")
                          // }
                          isDisabled={true}
                          // placeholder="Voice"
                          placeholder="All"
                          selectedLanguage={
                            isJsonString(data?.language)
                              ? JSON.parse(data?.language)
                              : ""
                          }
                          selectedAccent={
                            isJsonString(data?.accent)
                              ? JSON.parse(data?.accent)
                              : ""
                          }
                        />
                        <DictCell
                          label={index === 0 ? `Requested by` : ``}
                          value={wordCapitalizer(data?.created_by)}
                          // isDisabled={selectedEditRecord?.id !== data.id}
                          isDisabled={true}
                          id={`created_by-${data.id}`}
                        />
                        <DictCell
                          label={index === 0 ? `Edited by` : ``}
                          value={wordCapitalizer(data?.edited_by)}
                          // isDisabled={selectedEditRecord?.id !== data.id}
                          isDisabled={true}
                          id={`edited_by-${data.id}`}
                        />
                        <DictSelect
                          label={index === 0 ? `Status` : ``}
                          defaultValue={
                            isJsonString(data?.status)
                              ? JSON.parse(data?.status)
                              : {
                                  label: wordCapitalizer(
                                    data?.status || "Pending"
                                  ),
                                  value: data?.status,
                                }
                          }
                          id={`status-${data.id}`}
                          isDisabled={selectedEditRecord?.id !== data.id}
                          placeholder="Status"
                        />
                        <div className="dict_report_input_wrapper">
                          {index === 0 && (
                            <div
                              className="ogWord_header"
                              style={{
                                position: "relative",
                                bottom: "8px",
                                fontSize: "16px",
                              }}
                            >
                              {"Action"}
                            </div>
                          )}

                          <div className="dict_report_action_btn_container">
                            <ButtonWrapper
                              disabled={
                                selectedEditRecord?.id === data.id
                                  ? !editedData?.original_word ||
                                    !editedData?.formatted_word ||
                                    !(isJsonString(editedData?.language)
                                      ? JSON.parse(editedData?.language)?.value
                                      : "") ||
                                    !(isJsonString(editedData?.accent)
                                      ? JSON.parse(editedData?.accent)?.value
                                      : "")
                                  : false
                              }
                              size="s"
                              variant={
                                selectedEditRecord?.id === data.id
                                  ? "filled"
                                  : "outlined"
                              }
                              className="dict_report_save_btn"
                              onClick={() => {
                                if (selectedEditRecord?.id === data.id) {
                                  updateRow(data);
                                } else {
                                  setSelectedEditRecord(data);
                                }
                              }}
                            >
                              {selectedEditRecord?.id === data.id
                                ? "Save"
                                : "Edit"}
                            </ButtonWrapper>
                            <Delete
                              fill={"var(--color-icon)"}
                              // stroke={"var(--color-icon)"}
                              className="dict_report_delete_icon"
                              onClick={() => {
                                deleteRow(data);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="dict_report_modal_sub_header">No data found</p>
          )}
        </>
      )}
    </Layout>
  );
};

export default DictReport;
