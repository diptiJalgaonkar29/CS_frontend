import React from "react";
import { useSelector } from "react-redux";
import "./ReplaceVoiceModal.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";

const ReplaceVoiceModal = ({
  isOpen,
  onClose,
  newSelectedVoice,
  changeAllOccurrencesOfSelectedVoice,
  changeSelectedVoiceOnly,
}) => {
  const { replaceVoiceMeta } = useSelector((state) => state?.voices);
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Confirm">
      <div className="replace_voice_menu">
        {/* <p className="replace_voice_menu_header">Confirm</p> */}
        <p className="replace_voice_content">
          Do you want to change{" "}
          <span className="replace_voice_name">
            {" "}
            {replaceVoiceMeta?.artistName}
          </span>
          's voice to
          <span className="replace_voice_name">
            {" "}
            {newSelectedVoice?.artistName}
          </span>
          's voice for all the contents ?
        </p>
        <div className="replace_voice_menu_btns">
          <ButtonWrapper
            // style={{ width: "250px" }}
            onClick={() => {
              onClose?.();
            }}
          >
            Cancel
          </ButtonWrapper>

          <ButtonWrapper
            style={{
              // width: "250px",
              color: "var(--color-primary)",
              borderColor: "var(--color-primary)",
            }}
            onClick={() => {
              changeSelectedVoiceOnly();
              onClose?.();
            }}
          >
            Change Selected
          </ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            // style={{ width: "250px" }}
            onClick={() => {
              changeAllOccurrencesOfSelectedVoice();
              onClose?.();
            }}
          >
            Change All
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ReplaceVoiceModal;
