import React, { useRef, useState } from "react";
import cross from "../../../../static/common/cross.svg";
import Restart from "../../../../static/voice/restart.svg";
import "./TTSCustomInput.css";
import { useDispatch, useSelector } from "react-redux";
import {
  UPDATE_DICT_DATA,
  UPDATE_INSERT_DICT_DATA,
} from "../../redux/dictionarySlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import processTTSV2ImmediateResponse from "../../services/voiceExternal/processTTSV2ImmediateResponse";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { ElevenLabsVoiceProvider } from "../../constants/VoiceProviders";

export default function TTSCustomInput({
  defaultValue,
  showCross = false,
  isDisabled = false,
  id = "",
  label = "",
  type = "UPDATE",
  mp3 = "",
  // ttsType = "pro",
  selectedLanguage,
  selectedAccent,
  selectedVoice,
  playingAudio,
  playPause,
  input,
}) {
  const inputRef = useRef();
  const dispatch = useDispatch();
  const { voicesList } = useSelector((state) => state?.voicesList);
  const { authMeta } = useSelector((state) => state?.auth);
  const [isLoading, setIsLoading] = useState(false);

  const processTTSData = () => {
    if (defaultValue === "") {
      showNotification("ERROR", "Please add word!");
      return;
    }
    if (!selectedLanguage?.value) {
      showNotification("ERROR", "Please select language!");
      return;
    }
    if (!selectedAccent?.value) {
      showNotification("ERROR", "Please select accent!");
      return;
    }
    setIsLoading(true);
    let artistName =
      (selectedVoice?.label !== "All" ? selectedVoice?.label : "") || "";

    var voiceMeta =
      voicesList?.find((voice) => {
        return (
          voice[KEY_REF["language"]]?.toLowerCase() ===
            selectedLanguage?.label?.toLowerCase() &&
          voice[KEY_REF["accent"]]?.toLowerCase() ===
            selectedAccent?.label?.toLowerCase() &&
          (!!artistName
            ? voice[KEY_REF["artistName"]]?.toLowerCase() ===
              artistName?.toLowerCase()
            : true)
        );
      }) || voicesList?.[0];

    let ShortName = voiceMeta?.[KEY_REF["voiceId"]];
    const ttsProcessObj = {
      VoiceText: defaultValue,
      ...(voiceMeta[KEY_REF["voiceProvider"]] !== ElevenLabsVoiceProvider
        ? { SpeakingSpeed: "1", pitch: "1" }
        : {
            voiceSettingsElevenLabs: {
              stability: "0.5",
              similarityBoost: "0.7",
              style: "0",
              useSpeakerBoost: true,
            },
          }),
      SpeakingStyle: "general",
      voiceProvider: voiceMeta[KEY_REF["voiceProvider"]],
      TTSType: "pro",
      ShortName,
      Locale: selectedAccent?.value,
      CallBackUrl: `${document.location.origin}/api/tts_utils/ttsResponse`,
      AdditionalInfo: authMeta?.username,
    };

    let restartIcon = document.getElementById(`restart_dict_${id}`);
    let loadingIcon = document.getElementById(`loading_dict_${id}`);
    if (restartIcon) {
      restartIcon.style.display = "none";
    }
    if (loadingIcon) {
      loadingIcon.style.display = "block";
    }
    let ttsArtistMeta = {
      language: selectedLanguage?.label || null,
      language_code: selectedLanguage?.value || null,
      accent: selectedAccent?.value || null,
      accent_code: selectedAccent?.value || null,
      artist: voiceMeta?.[KEY_REF["artistName"]] || null,
      artist_code: voiceMeta?.[KEY_REF["voiceId"]] || null,
    };
    processTTSV2ImmediateResponse({
      jobRequest: ttsProcessObj,
      ttsArtistMeta,
      onSuccess: (res) => {
        // console.log("res", res.data);
        if (type === "INSERT") {
          dispatch(
            UPDATE_INSERT_DICT_DATA({
              id: `${id}_url`,
              value: res.data.mP3Path,
            })
          );
        } else {
          dispatch(
            UPDATE_DICT_DATA({
              id: `${id.split("-")[0]}_url-${id.split("-")[1]}`,
              value: res.data.mP3Path,
            })
          );
        }
      },
      onError: function (error) {
        showNotification("ERROR", "Something went wrong!");
        console.log("Something went wrong...", error);
      },
      onFinally: () => {
        if (restartIcon) {
          restartIcon.style.display = "block";
        }
        if (loadingIcon) {
          loadingIcon.style.display = "none";
        }
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="dict_input_wrapper">
      {label !== "" && <div className="ogWord_header">{label}</div>}
      <div className="dict_input_container">
        <input
          type="text"
          className={`dict_input ${
            isDisabled ? "disabled_dict_input" : "active_dict_input"
          } ${showCross && !isDisabled ? "short_input" : "long_input"}`}
          placeholder={input === "firstInput" ? "happy" : "hap-ee"}
          id={id}
          ref={inputRef}
          value={defaultValue}
          disabled={isDisabled}
          autoComplete={"off"}
          onChange={(e) => {
            if (type === "INSERT") {
              dispatch(UPDATE_INSERT_DICT_DATA({ id, value: e.target.value }));
            } else {
              dispatch(UPDATE_DICT_DATA({ id, value: e.target.value }));
            }
          }}
        />
        {showCross && !isDisabled && (
          <IconWrapper
            icon="Close"
            className="dict_cross"
            onClick={() => {
              if (type === "INSERT") {
                dispatch(UPDATE_INSERT_DICT_DATA({ id, value: "" }));
              } else {
                dispatch(UPDATE_DICT_DATA({ id, value: "" }));
              }
              inputRef.current.focus();
            }}
          />
        )}
        {mp3 === "" ? (
          <>
            <IconWrapper
              icon="Process"
              id={`restart_dict_${id}`}
              className={`dict_play_restart_Icon ${isLoading ? "loading" : ""}`}
              onClick={() => {
                processTTSData();
              }}
            />
            <IconWrapper
              icon="Process"
              id={`loading_dict_${id}`}
              className="dict_play_restart_Icon loading"
              style={{
                display: "none",
              }}
            />
          </>
        ) : (
          <>
            {id !== playingAudio?.playingIndex || !playingAudio?.isPlaying ? (
              <button
                onClick={() => {
                  playPause({
                    mp3,
                    id,
                  });
                }}
                className={`play_pause_dict_icon`}
              >
                <IconWrapper
                  icon="Play"
                  className="voice_card_icon_large play_icon"
                />
              </button>
            ) : (
              <button
                onClick={() => {
                  playPause({
                    mp3,
                    id,
                  });
                }}
                className={`play_pause_dict_icon`}
              >
                <IconWrapper
                  icon="Pause"
                  className="voice_card_icon_large pause_icon"
                  style={{
                    scale: "1.1",
                  }}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
