import React from "react";
import { WppModal } from "@wppopen/components-library-react";

const WPPModal = ({ isOpen, title, className = "", children }) => {
  return (
    <WppModal open={isOpen} className={`wppModal ${className}`}>
      {isOpen && (
        <div
          slot="body"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "80vh",
            padding: "20px 45px",
          }}
        >
          {!!title && (
            <h3
              slot="header"
              style={{
                margin: "25px auto",
                textAlign: "center",
                fontSize: "24px",
                color: "var(--color-white)",
              }}
              className="wpp_modal_header"
            >
              {title}
            </h3>
          )}
          {children}
        </div>
      )}
    </WppModal>
  );
};

export default WPPModal;
