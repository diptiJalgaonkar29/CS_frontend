import React from "react";
import { Dialog } from "@mui/material";
import "./SonicModal.css";

function SonicModal({ onClose, isOpen, title, className, children }) {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="SonicModal_dialog-title"
      open={isOpen}
      className={`SonicModal_dialog ${className}`}
    >
      {title && (
        <h3 slot="header" className="SonicModal_title boldFamily">
          {title}
        </h3>
      )}
      {children}
    </Dialog>
  );
}
export default SonicModal;
