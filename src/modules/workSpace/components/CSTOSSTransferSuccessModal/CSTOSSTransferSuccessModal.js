import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import "./CSTOSSTransferSuccessModal.css";

const CSTOSSTransferSuccessModal = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="CSTOSS_transfer_success_modal_container">
        <div className="transfer_success_message_container">
          <p className="transfer_success_message_bold">
            Your track is being transferred!
          </p>
          <p className="transfer_success_message">
            We are processing your request. You will be notified by email when
            the transfer to Sonic Hub is completed
          </p>
          <p className="transfer_success_message">
            In the meantime, keep enjoying Creation Station!
          </p>
        </div>
        <div className="CSTOSS_transfer_success_btn_container">
          <ButtonWrapper variant="filled" onClick={onClose}>
            Back to my workspace
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};
export default CSTOSSTransferSuccessModal;
