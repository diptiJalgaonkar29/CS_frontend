import React, { useEffect, useState } from "react";
import "./SpeakingStylePopover.css";
import { useSelector } from "react-redux";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import capitalizeFirstLetter from "../../../../utils/capitalizeFirstLetter";
import CustomPopover from "../../../../common/components/customPopover/CustomPopover";

const SpeakingStylePopover = ({
  selectedSpeakingStyle,
  voiceId,
  onVoiceTabHeaderChangeSpeakingStyleValue,
}) => {
  const { voicesList } = useSelector((state) => state?.voicesList);
  const [speakingStyleList, setSpeakingStyleList] = useState([]);
  const [isPopoverClosed, setIsPopoverClosed] = useState(false);

  useEffect(() => {
    let selectedVoice = voicesList?.find((voice) => {
      return voice?.[KEY_REF["voiceId"]] == voiceId;
    });
    setSpeakingStyleList((selectedVoice?.ampVoiceProvider === "azure" ?
      selectedVoice?.[KEY_REF["ampAzureSpeakingTone"]]
      : selectedVoice?.[KEY_REF["speakingStyles"]]) || []);
  }, [voiceId]);

  if (!speakingStyleList || speakingStyleList?.length == 0) {
    return <></>;
  }

  return (
    <CustomPopover
      renderBtn={
        <button className="voice_tab_header_btn">
          Speaking Style :{" "}
          {capitalizeFirstLetter(selectedSpeakingStyle) || "General"}
        </button>
      }
      closePopover={isPopoverClosed}
      popoverContent={
        <ul className="speaking_style_list">
          {speakingStyleList?.map((style) => (
            <li
              key={style}
              className="speaking_style_item"
              onClick={() => {
                onVoiceTabHeaderChangeSpeakingStyleValue(style);
                setIsPopoverClosed(true);
              }}
            >
              {capitalizeFirstLetter(style)}
            </li>
          ))}
        </ul>
      }
    />
  );
};

export default SpeakingStylePopover;
