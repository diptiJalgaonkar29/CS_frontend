import React from "react";
import "./ProfanityModal.css";
import { useDispatch, useSelector } from "react-redux";
import { RESET_PROFANITY_META } from "../../redux/profanitySlice";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const ProfanityModal = () => {
  const dispatch = useDispatch();
  const {
    isProfanityModalOpen,
    expletiveWords,
    ampProfanity,
    expletiveWordCount,
  } = useSelector((state) => state?.profanity);

  const onProfanityModalClose = () => {
    dispatch(RESET_PROFANITY_META());
  };

  const expletiveWordsArr = !!expletiveWords?.slice(1, -1)
    ? expletiveWords?.slice(1, -1)?.split(",")
    : [];

  return (
    <ModalWrapper
      isOpen={isProfanityModalOpen}
      onClose={onProfanityModalClose}
      title={"Profanity"}
      className="profanity_modal"
    >
      <p className="profanity_title">
        Expletive word count :{" "}
        <span className="profanity_value">{expletiveWordCount ?? 0}</span>
      </p>
      {expletiveWordsArr?.length > 0 && (
        <>
          <p className="profanity_title">Expletive words :</p>
          <ul className="profanity_expletive_words_list">
            {expletiveWordsArr?.map((word) => (
              <li className="profanity_expletive_words">
                <IconWrapper
                  icon={ampProfanity === "green" ? "Check" : "Exclamation"}
                  className={`profanity_icon ${ampProfanity}`}
                />
                <span className="profanity_value">{word}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="profanity_btns">
        <ButtonWrapper onClick={onProfanityModalClose}>Close</ButtonWrapper>
      </div>
    </ModalWrapper>
  );
};

export default ProfanityModal;
