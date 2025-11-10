import React, { useEffect } from "react";
import "./TextBoxes.css";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  REMOVE_VOICE,
  ADD_CONTENT,
  ADD_NEW_TTS_SCRIPT_IDS,
} from "../../redux/voicesSlice";
import VoiceInputHeader from "../voiceInputHeader/VoiceInputHeader";
import showNotification from "../../../../common/helperFunctions/showNotification";
import useDidMount from "../../../../customHooks/useDidMount";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { TTS_STATUS } from "../../constants/TTSStatus";
import processTTSV2 from "../../services/voiceExternal/processTTSV2";
import VoiceInputHeaderElevenLabs from "../voiceInputHeaderElevenLabs/VoiceInputHeaderElevenLabs";
import { ElevenLabsVoiceProvider } from "../../constants/VoiceProviders";
import { SET_PROFANITY_META } from "../../redux/profanitySlice";
import { PROFANITY_STATUS } from "../../constants/profanityStatus";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import getTTSFailedStatusMessage from "../../../../utils/getTTSFailedStatusMessage";
import countBreakTags from "../../../../utils/countBreakTags";
import removeBreakTags from "../../../../utils/removeBreakTags";

const TextBoxes = ({ voice, voiceIndex, playingAudio, playPause }) => {
  const { selectedVoices, disabledVoices } = useSelector(
    (state) => state.voices
  );
  const { brandMeta } = useSelector((state) => state.auth);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [TTSOptionContainerHoverId, setTTSOptionContainerHoverId] =
    useState("");
  const [isContentPasted, setIsContentPasted] = useState(false);
  const [contentIndex, setContentIndex] = useState(null);
  const [contentCursorIndex, setContentCursorIndex] = useState(null);
  const [inputList, setInputList] = useState({
    data: [...selectedVoices[voiceIndex].content],
    removedTextBoxMp3: "",
    removedTextBoxUUID: "",
  });
  const [requestBody, setRequestBody] = useState({
    request_json: inputList?.data,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (isContentPasted) {
      document
        .getElementById(`content_voiceIndex${voiceIndex}_index_${contentIndex}`)
        .focus();
      document
        .getElementById(`content_voiceIndex${voiceIndex}_index_${contentIndex}`)
        .setSelectionRange(contentCursorIndex, contentCursorIndex);
      setIsContentPasted(false);
    }
  }, [isContentPasted]);

  const didMount = useDidMount();

  useEffect(() => {
    document.getElementById("removeIcon_0") &&
      (document.getElementById("removeIcon_0").style.display = "none");
    if (didMount) {
      dispatch(
        ADD_CONTENT({
          inputList: inputList?.data,
          voiceIndex,
          removedTextBoxMp3: inputList?.removedTextBoxMp3,
          removedTextBoxUUID: inputList?.removedTextBoxUUID,
        })
      );
    }
  }, [JSON.stringify(inputList?.data)]);

  const handleRemoveClick = (index) => {
    const list = [...inputList?.data];
    let removedItem = list.splice(index, 1);
    let newList = list.map((item, itemIndex) => ({
      ...item,
      index: itemIndex,
    }));
    setInputList({
      data: newList,
      removedTextBoxMp3: removedItem?.[0]?.mp3 || "",
      removedTextBoxUUID: removedItem?.[0]?.voiceUUID || "",
    });
    setRequestBody({ ...requestBody, request_json: list });
  };

  const processTTSData = (_jobData) => {
    if (_jobData.content == "") {
      showNotification("ERROR", "Please add some content!");
      return;
    }

    processTTSV2({
      projectID,
      jobRequest: [_jobData],
      onSuccess: (res) => {
        let ttsScriptIds = res.data?.map((data) => data?.scriptId);
        dispatch(ADD_NEW_TTS_SCRIPT_IDS(ttsScriptIds));
      },
      onError: () => { },
    });
  };

  const isHovered = (voiceUUID, status) => {
    if (status === TTS_STATUS.STARTED) return false;
    return TTSOptionContainerHoverId === `inputbox_${voiceUUID}`;
  };

  const onVoiceTabHeaderChangeSpeedValue = (speed, index) => {
    updateVoiceMeta("speed", speed + "", index);
  };

  const onVoiceTabHeaderChangeSpeakingStyleValue = (speakingStyle, index) => {
    updateVoiceMeta("speakingStyle", speakingStyle, index);
  };

  const handleInputChange = (e, index) => {
    updateVoiceMeta("content", e.target?.value || "", index);
  };

  const handleInputPaste = (e, index) => {
    setIsContentPasted(true);
    setContentIndex(index);
    const startPos = e.target?.selectionStart;
    const endPos = e.target?.selectionEnd;
    setContentCursorIndex(startPos + e?.clipboardData?.getData("Text")?.length);
    const copiedText = removeBreakTags(e.clipboardData.getData("Text"));
    const text =
      e.target.value === ""
        ? copiedText
        : e.target.value.slice(0, startPos) +
        copiedText +
        e.target.value.slice(endPos);

    updateVoiceMeta("content", text, index);
  };

  function insert(str, index, value) {
    return str?.substr(0, index) + value + str?.substr(index);
  }

  const insertBreak = (
    inputId,
    content,
    index,
    breakTime,
    isElevenLab = false
  ) => {
    const input = document.getElementById(inputId);
    const position = input.selectionStart;
    const breakTag = isElevenLab
      ? `<break time="${breakTime}s">`
      : `<break time = "${breakTime}s"/>`;
    let newStr = insert(content, position, breakTag);
    updateVoiceMeta("content", newStr, index);
  };

  const updateVoiceMeta = (key, value, index) => {
    const list = [...inputList?.data];
    let oldData = list[index];
    let { brandMeta } = getCSUserMeta();
    let data = {
      ...oldData,
      [key]: value,
      mp3: "",
      status: TTS_STATUS.NOT_STARTED,
      statusMessage: "",
      duration: 0,
      ...(brandMeta?.profanity && {
        expletiveWordCount: null,
        ampProfanity: null,
        expletiveWords: null,
        profanityStatus: PROFANITY_STATUS.NOT_STARTED,
      }),
    };
    let removedItem = list.splice(index, 1, data);
    // console.log("removedItem", removedItem?.[0]);
    setInputList({
      data: list,
      removedTextBoxMp3: removedItem?.[0]?.mp3 || "",
      removedTextBoxUUID: removedItem?.[0]?.voiceUUID || "",
    });
    setRequestBody({ ...requestBody, request_json: list });
  };

  return (
    <div className="inputWrapper">
      {inputList?.data?.map((textBoxEle, index) => {
        let isBreakTimeValid = countBreakTags(
          textBoxEle.content,
          textBoxEle.voiceProvider
        );
        const isVoiceProcessing = textBoxEle?.status === TTS_STATUS.STARTED;
        const isVoiceDisabled =
          textBoxEle?.status === TTS_STATUS.VOICE_DISABLED ||
          disabledVoices?.includes(textBoxEle?.voice);
        const isTextBoxHovered = isHovered(
          textBoxEle?.voiceUUID,
          textBoxEle?.status
        );
        return (
          <div
            key={`inputbox_${textBoxEle?.voiceUUID}`}
            className={`inputbox inputbox_${textBoxEle?.voiceUUID} ${isVoiceProcessing
              ? "tts_processing"
              : isVoiceDisabled
                ? "voice_disabled"
                : ""
              }`}
            id={`inputbox_${textBoxEle?.voiceUUID}`}
          >
            {/* if voice is processing */}
            {isVoiceProcessing && (
              <div className="tts_processing_loader">
                <p className="tts_processing_loader_text">
                  The voice is processing...
                </p>
              </div>
            )}
            {/* if voice is disabled */}
            {isVoiceDisabled && (
              <div className="tts_processing_loader">
                <p className="tts_processing_loader_text">
                  This voice is disabled. Please select another voice.
                </p>
              </div>
            )}
            <div
              className={`inputbox_hoverable_container`}
              onMouseEnter={() => {
                if (isVoiceDisabled || isVoiceProcessing) return;
                setTTSOptionContainerHoverId(
                  `inputbox_${textBoxEle?.voiceUUID}`
                );
              }}
              onMouseLeave={() => {
                setTTSOptionContainerHoverId("");
              }}
            >
              <div
                className={`inputbox_header`}
                style={{
                  height: isTextBoxHovered ? "40px" : "0px",
                }}
              >
                {isTextBoxHovered && (
                  <>
                    {textBoxEle?.voiceProvider !== ElevenLabsVoiceProvider ? (
                      <VoiceInputHeader
                        speed={+textBoxEle?.speed}
                        onSpeedChange={(speed) => {
                          onVoiceTabHeaderChangeSpeedValue(speed, index);
                        }}
                        onVoiceTabHeaderChangeSpeakingStyleValue={(
                          speakingStyle
                        ) =>
                          onVoiceTabHeaderChangeSpeakingStyleValue(
                            speakingStyle,
                            index
                          )
                        }
                        selectedSpeakingStyle={textBoxEle?.speakingStyle}
                        voiceId={textBoxEle?.voice}
                        inputId={`content_voiceIndex${voiceIndex}_index_${index}`}
                        content={textBoxEle?.content || ""}
                        index={index}
                        insertBreak={insertBreak}
                      />
                    ) : (
                      <VoiceInputHeaderElevenLabs
                        updateVoiceMeta={updateVoiceMeta}
                        voiceMeta={textBoxEle}
                        inputId={`content_voiceIndex${voiceIndex}_index_${index}`}
                        content={textBoxEle?.content || ""}
                        index={index}
                        insertBreak={insertBreak}
                        maxSeconds={3}
                      />
                    )}
                  </>
                )}
              </div>
              <div className="textarea_wrapper">
                <textarea
                  placeholder="What would you like this AI voice to say?"
                  autoComplete="off"
                  className="inputTextBox"
                  name="content"
                  disabled={isVoiceDisabled || isVoiceProcessing}
                  id={`content_voiceIndex${voiceIndex}_index_${index}`}
                  value={textBoxEle.content}
                  onPaste={(e) => {
                    if (isVoiceDisabled || isVoiceProcessing) return;
                    e.preventDefault();
                    handleInputPaste(e, index);
                  }}
                  onChange={(e) => {
                    if (isVoiceDisabled || isVoiceProcessing) return;
                    handleInputChange(e, index);
                  }}
                />
                <div className="btn-box">
                  {textBoxEle?.profanityStatus ===
                    PROFANITY_STATUS.COMPLETED && (
                      <IconWrapper
                        icon={
                          textBoxEle?.ampProfanity === "green"
                            ? "Check"
                            : "Exclamation"
                        }
                        className={`profanity_icon ${textBoxEle?.ampProfanity}`}
                        onClick={() => {
                          if (textBoxEle?.ampProfanity === "red") {
                            dispatch(
                              SET_PROFANITY_META({
                                isProfanityModalOpen: true,
                                purifyRequestId: textBoxEle?.purifyRequestId,
                                expletiveWordCount:
                                  textBoxEle?.expletiveWordCount,
                                ampProfanity: textBoxEle?.ampProfanity,
                                expletiveWords: textBoxEle?.expletiveWords,
                                profanityStatus: textBoxEle?.profanityStatus,
                              })
                            );
                          }
                        }}
                      />
                    )}
                  {textBoxEle?.profanityStatus === PROFANITY_STATUS.STARTED &&
                    brandMeta?.profanity && (
                      <div className="profanity_loader" />
                    )}
                  {(!!textBoxEle?.statusMessage ||
                    textBoxEle?.profanityStatus ===
                    PROFANITY_STATUS.FAILED) && (
                      <CustomToolTip
                        title={getTTSFailedStatusMessage(
                          textBoxEle?.statusMessage
                        )}
                        placement="bottom"
                      >
                        <div>
                          <IconWrapper
                            icon={"Exclamation"}
                            className={`tts_failed_icon red`}
                          />
                        </div>
                      </CustomToolTip>
                    )}
                  {!textBoxEle.mp3 ? (
                    <>
                      <button
                        disabled={
                          isBreakTimeValid ||
                          isVoiceProcessing ||
                          isVoiceDisabled
                        }
                        className={`TTS_process_Icon`}
                        onClick={() => {
                          processTTSData(inputList?.data?.[index], index);
                        }}
                      >
                        <IconWrapper
                          icon="Process"
                          id={`restart_voiceIndex${voiceIndex}_index_${index}`}
                          className={`TTS_restart_Icon`}
                        />
                      </button>
                      {/* <IconWrapper
                        icon="Process"
                        id={`loading_voiceIndex${voiceIndex}_index_${index}`}
                        className="TTS_restart_Icon loading"
                        style={{
                          display: "none",
                        }}
                      /> */}
                    </>
                  ) : (
                    <>
                      {`${textBoxEle.voiceIndex}-${textBoxEle.index}` ===
                        playingAudio?.playingIndex &&
                        playingAudio?.isLoading ? (
                        <IconWrapper
                          icon="Process"
                          id={`loading_voiceIndex${voiceIndex}_index_${index}`}
                          className="voice_card_icon_large play_tts_icon TTS_restart_Icon loading"
                        />
                      ) : (
                        <>
                          {`${textBoxEle.voiceIndex}-${textBoxEle.index}` !==
                            playingAudio?.playingIndex ||
                            !playingAudio?.isPlaying ? (
                            <IconWrapper
                              icon="Play"
                              onClick={() => {
                                playPause(textBoxEle);
                              }}
                              disabled={!textBoxEle.mp3}
                              className="voice_card_icon_large play_tts_icon TTS_play_Icon"
                            />
                          ) : (
                            <IconWrapper
                              icon="Pause"
                              className="voice_card_icon_large pause_tts_icon TTS_pause_Icon"
                              disabled={!textBoxEle.mp3}
                              onClick={() => {
                                playPause(textBoxEle);
                              }}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                  <IconWrapper
                    icon="Trash"
                    className="closeTextBoxIcon"
                    fill="#434343"
                    onClick={() => {
                      if (inputList?.data?.length !== 1) {
                        handleRemoveClick(index);
                      } else {
                        let voiceData = {
                          ...voice,
                          voiceIndex,
                          index,
                          mp3: textBoxEle.mp3,
                        };
                        dispatch(REMOVE_VOICE(voiceData));
                      }
                    }}
                  />
                </div>
              </div>
              {isBreakTimeValid && (
                <p className="textarea_wrapper_error_message">
                  {textBoxEle.voiceProvider === "elevenLabs"
                    ? "break time must be an integer or decimal"
                    : "break time must be an integer"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TextBoxes;
