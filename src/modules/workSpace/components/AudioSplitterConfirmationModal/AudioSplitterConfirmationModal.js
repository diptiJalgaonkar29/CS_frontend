import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import "./AudioSplitterConfirmationModal.css";

const AudioSplitterConfirmationModal = ({
  isOpen,
  onClose,
  retention,
  selectAudio,
  UploadVideoAndSplitAudio,
  setSubmitting,
}) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Permission to continue"
    >
      <div className="AudioSplitterConfirmationModal_container">
        <p className="sub_title">
          Your selection to retain the {retention?.toLowerCase()} from your
          video will disable the function to add {retention?.toUpperCase()} to
          your project. You only will be able to add{" "}
          {retention === "Voice" ? "MUSIC" : "VOICE"} to your project. Would you
          like to continue?
        </p>

        <div className="video_uploader_confirmation_btn_containerV2">
          <ButtonWrapper onClick={onClose}>Back</ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            onClick={() => {
              UploadVideoAndSplitAudio({
                split: retention === "Voice" ? 0 : 1,
                mute: 0,
                retention,
                selectAudio,
                setSubmitting,
              });
            }}
          >
            Continue
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};
export default AudioSplitterConfirmationModal;
