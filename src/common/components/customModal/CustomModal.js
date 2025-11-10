import { Dialog } from "@mui/material";
import "./CustomModal.css";

function CustomModal({ onClose, isOpen, className, children }) {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="custom_modal"
      open={isOpen}
      className={`custom_modal_container ${className}`}
    >
      {children}
    </Dialog>
  );
}
export default CustomModal;
