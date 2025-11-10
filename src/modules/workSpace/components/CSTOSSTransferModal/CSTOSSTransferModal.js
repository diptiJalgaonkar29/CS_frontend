import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import "./CSTOSSTransferModal.css";

const CSTOSSTransferModal = ({ isOpen, onClose, onTransfer, trackName }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="CSTOSS_transfer_modal_container">
        <p className="transfer_confirmation_message">
          You are about to transfer the track <i>"{trackName}"</i> &nbsp;to
          Sonic Hub. This will give the access to all Sonic Hub users to listen,
          download, and use this track into any brand material. Would you like
          to continue?
        </p>
        <div className="CSTOSS_transfer_btn_container">
          <ButtonWrapper onClick={onClose}>Cancel</ButtonWrapper>
          <ButtonWrapper variant="filled" onClick={() => onTransfer?.()}>
            Transfer & Export
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};
export default CSTOSSTransferModal;
