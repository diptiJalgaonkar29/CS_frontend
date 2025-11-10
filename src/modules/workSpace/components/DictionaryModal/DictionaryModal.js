import React, { useEffect, useState } from "react";
import DictSelect from "../DictSelect/DictSelect";
import "./DictionaryModal.css";
import { ReactComponent as Delete } from "../../../../static/common/delete.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  DELETE_DICT_DATA,
  RESET_DICT_META,
  RESET_INSERT_DICT_DATA,
  SET_DICT_DATA,
  SET_DICT_META,
  UPDATE_DICT_DATA,
} from "../../redux/dictionarySlice";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import { SET_VOICE_META } from "../../redux/voicesSlice";
import TTSCustomInput from "../TTSCustomInput/TTSCustomInput";
import DictCell from "../DictCell/DictCell";
import wordCapitalizer from "../../../../utils/wordCapitalizer";
import isJsonString from "../../../../utils/isJsonString";
import addDictionaryMeta from "../../services/DictionaryDB/addDictionaryMeta";
import updateDictionaryMeta from "../../services/DictionaryDB/updateDictionaryMeta";
import deleteDictionaryMeta from "../../services/DictionaryDB/deleteDictionaryMeta";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import { SET_VOICE_LIST_META } from "../../redux/voicesListSlice";
import getTTSVoicesV2 from "../../services/voiceExternal/getTTSVoicesV2";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import syncDataToVoicebox from "../../services/voiceExternal/syncDataToVoicebox";
import useTTSSampleVoicePlayPause from "../../../../customHooks/useTTSSampleVoicePlayPause";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { useConfig } from "../../../../customHooks/useConfig";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import getDictionaryModalMeta from "../../services/DictionaryDB/getDictionaryModalMeta";

const reqiredVoiceData = (arr1, arr2, filterBy) => {
  let res = [];
  res = arr1?.filter((el) => {
    return arr2?.find((element) => {
      return element === el[filterBy];
    });
  });
  return res;
};

const DictionaryModal = () => {
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const { dictData, insertDictData } = useSelector((state) => state.dictionary);
  const dispatch = useDispatch();
  const { authMeta } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const { isDictModalOpen } = useSelector((state) => state?.voices);
  const { voicesList, isVoicesListFetching } = useSelector(
    (state) => state?.voicesList
  );
  let { jsonConfig } = useConfig();

  const getAllDictData = () => {
    setIsLoading(true);
    getDictionaryModalMeta({
      onSuccess: (response) => {
        dispatch(SET_DICT_DATA(response?.data || []));
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  useEffect(() => {
    if (isDictModalOpen) {
      getAllDictData();
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
    }
  }, [isDictModalOpen]);

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
        dispatch(
          SET_VOICE_LIST_META({
            isVoicesListFetching: false,
          })
        );
      },
    });
  };

  const insertRow = (insertDictData) => {
    setIsLoading(true);
    setSelectedEditRecord(null);
    dispatch(RESET_INSERT_DICT_DATA());
    let dictMeta = {
      originalWord: insertDictData?.original_word,
      formattedWord: insertDictData?.formatted_word,
      language: JSON.stringify(insertDictData?.language),
      accent: JSON.stringify(insertDictData?.accent),
      voice: JSON.stringify(insertDictData?.voice),
      uuidPronunciation: null,
      status: "pending",
    };
    addDictionaryMeta({
      dictMeta,
      onSuccess: () => {
        getAllDictData();
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  const updateRow = (data) => {
    setIsLoading(true);
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
    <div>
      {isLoading && <CustomLoader loaderMsgFor="VOICE" />}
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
      <ModalWrapper
        isOpen={Boolean(isDictModalOpen)}
        onClose={() => dispatch(SET_VOICE_META({ isDictModalOpen: false }))}
        title="Edit Pronunciation"
      >
        <>
          {/* <p className="dict_modal_header">pronunciation</p> */}
          <p className="dict_modal_sub_header">
            Type a word, its alternative pronounciation, and choose the context
            in which it should be modified
          </p>
          <div className="dict_data_container">
            <div className="dict_data_row">
              <TTSCustomInput
                defaultValue={insertDictData?.original_word}
                mp3={insertDictData?.original_word_url}
                showCross={true}
                type="INSERT"
                id={"original_word"}
                label="Word to modify *"
                selectedLanguage={insertDictData?.language}
                selectedAccent={insertDictData?.accent}
                selectedVoice={insertDictData?.voice}
                playingAudio={playingAudio}
                playPause={playPause}
                input={"firstInput"}
              />
              <TTSCustomInput
                defaultValue={insertDictData?.formatted_word}
                mp3={insertDictData?.formatted_word_url}
                showCross={true}
                type="INSERT"
                id={"formatted_word"}
                label="New pronounciation *"
                selectedLanguage={insertDictData?.language}
                selectedAccent={insertDictData?.accent}
                selectedVoice={insertDictData?.voice}
                playingAudio={playingAudio}
                playPause={playPause}
              />
              <DictSelect
                defaultValue={insertDictData?.language}
                type="INSERT"
                id={"language"}
                name={KEY_REF["language"]}
                labelKey={KEY_REF["language"]}
                valueKey={KEY_REF["languageId"]}
                label="Language *"
                placeholder="Choose Language"
                selectedLanguage={insertDictData?.language}
                selectedAccent={insertDictData?.accent}
              />
              <DictSelect
                defaultValue={insertDictData?.accent}
                type="INSERT"
                id={"accent"}
                name={KEY_REF["accent"]}
                labelKey={KEY_REF["accent"]}
                valueKey={KEY_REF["accentId"]}
                label="Accent *"
                isDisabled={!insertDictData?.language?.value}
                placeholder="Choose Accent"
                selectedLanguage={insertDictData?.language}
                selectedAccent={insertDictData?.accent}
              />
              <DictSelect
                defaultValue={insertDictData?.voice}
                type="INSERT"
                id={"voice"}
                name={KEY_REF["artistName"]}
                labelKey={KEY_REF["artistName"]}
                valueKey={KEY_REF["voiceUUID"]}
                isDisabled={!insertDictData?.accent?.value}
                label="Voice Name"
                placeholder="Choose AI Voice"
                selectedLanguage={insertDictData?.language}
                selectedAccent={insertDictData?.accent}
              />
              <DictCell
                value={wordCapitalizer(authMeta?.fullName)}
                label="Requested by"
              />
              <DictCell value={"-"} label="Status" />
              <div className="dict_input_wrapper">
                <div
                  className="ogWord_header"
                  style={{ position: "relative", bottom: "8px" }}
                >
                  {"Action"}
                </div>
                <div className="dict_action_btn_container">
                  <ButtonWrapper
                    size="s"
                    disabled={
                      !insertDictData?.original_word ||
                      !insertDictData?.formatted_word ||
                      !insertDictData?.language?.value ||
                      !insertDictData?.accent?.value
                    }
                    variant={"filled"}
                    className="dict_save_btn"
                    onClick={() => {
                      insertRow(insertDictData);
                    }}
                  >
                    Save
                  </ButtonWrapper>
                  <IconWrapper icon="Trash" className="dict_delete_icon" />
                </div>
              </div>
            </div>
            <div className="dict_divider">
              <hr style={{ margin: "10px 20px" }} />
            </div>
            {dictData?.length !== 0 && (
              <div className="dict_data_container_inner">
                {dictData?.map((data) => {
                  return (
                    <div className="dict_data_row" key={`dict_${data?.id}`}>
                      <TTSCustomInput
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
                        value={wordCapitalizer(data?.created_by)}
                        // isDisabled={selectedEditRecord?.id !== data.id}
                        isDisabled={true}
                        id={`created_by-${data.id}`}
                      />
                      <DictCell
                        // isDisabled={selectedEditRecord?.id !== data.id}
                        isDisabled={true}
                        value={
                          wordCapitalizer(data?.status || "Pending") ||
                          "Pending"
                        }
                        id={`${data.id}-${data?.status}`}
                      />
                      <div className="dict_input_wrapper">
                        <div className="dict_action_btn_container">
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
                                : data?.status === "approved"
                            }
                            size="s"
                            variant={
                              selectedEditRecord?.id === data.id
                                ? "filled"
                                : "outlined"
                            }
                            className="dict_save_btn"
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
                            className="dict_delete_icon"
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
            )}
          </div>
          <div className="dict_btn_container">
            <ButtonWrapper
              onClick={() => {
                dispatch(SET_VOICE_META({ isDictModalOpen: false }));
                setSelectedEditRecord(null);
                dispatch(RESET_DICT_META());
              }}
            >
              Close
            </ButtonWrapper>
          </div>
        </>
      </ModalWrapper>
    </div>
  );
};

export default DictionaryModal;
