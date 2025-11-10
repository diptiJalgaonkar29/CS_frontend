import React, { useEffect, useState } from "react";
import randomIntFromInterval from "../../../utils/randomIntFromInterval";
import "./CustomLoader.css";
import { useConfig } from "../../../customHooks/useConfig";
import ProgressBarWrapper from "../../../branding/componentWrapper/ProgressBarWrapper";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";

const CustomLoader = ({
  processPercent = -1,
  hideCancelBtn = false,
  appendLoaderText = "Loading now!",
  onCancelClick = () => {},
  loaderMsgFor = "AI_MUSIC",
}) => {
  let { jsonConfig } = useConfig();
  const [loadingText, setLoadingText] = useState("");

  const setRandomLoadingSentence = async (
    AI_MUSIC_LOADING_SENTENCES,
    AI_VOICE_LOADING_SENTENCES,
    loaderMsgFor = "AI_MUSIC"
  ) => {
    let loaderMsgArr =
      loaderMsgFor === "AI_MUSIC"
        ? AI_MUSIC_LOADING_SENTENCES
        : AI_VOICE_LOADING_SENTENCES;
    let randomInt = randomIntFromInterval(0, loaderMsgArr?.length - 1);
    let loadingSenetence = loaderMsgArr?.[randomInt] || "";
    try {
      setLoadingText(`${loadingSenetence} ${appendLoaderText}`);
    } catch (error) {
      setLoadingText(appendLoaderText);
    }
  };

  useEffect(() => {
    let intervalId;
    setRandomLoadingSentence(
      jsonConfig?.AI_MUSIC_LOADING_SENTENCES,
      jsonConfig?.AI_VOICE_LOADING_SENTENCES,
      loaderMsgFor
    );
    intervalId = setInterval(() => {
      setRandomLoadingSentence(
        jsonConfig?.AI_MUSIC_LOADING_SENTENCES,
        jsonConfig?.AI_VOICE_LOADING_SENTENCES,
        loaderMsgFor
      );
    }, jsonConfig?.LOADER_MSG_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="overlayBg loader_container">
      <div className="overlay">
        <div className="left">
          <CustomLoaderSpinner />
        </div>
        <div className="right">
          {loadingText ? (
            <p>{loadingText}</p>
          ) : (
            <div className="loader_text_skeleton">
              <p></p>
              <p></p>
            </div>
          )}
          {processPercent >= 0 && (
            <ProgressBarWrapper processPercent={processPercent} />
          )}
          {!hideCancelBtn && (
            <span
              className="cancel_btn"
              onClick={() => {
                onCancelClick();
                window.location.reload();
              }}
            >
              Cancel
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomLoader;
