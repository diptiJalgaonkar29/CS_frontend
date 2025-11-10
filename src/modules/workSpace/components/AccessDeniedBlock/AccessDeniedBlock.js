import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import NavStrings from "../../../../routes/constants/NavStrings";
import "./AccessDeniedBlock.css";

const AccessDeniedBlock = () => {
  const navigate = useNavigate();
  return (
    <div className="access_denied_wrapper">
      <div className="header_container">
        <p className="sub_header">Access denied!</p>
        <ButtonWrapper
          style={{ marginTop: "10px" }}
          onClick={() => {
            navigate(NavStrings.HOME);
          }}
        >
          Go to Home
        </ButtonWrapper>
      </div>
    </div>
  );
};

export default AccessDeniedBlock;
