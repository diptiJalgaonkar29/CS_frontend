import React from "react";
import "./BackButton.css";
import { useNavigate } from "react-router-dom";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";

const BackButton = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="BackButton_container" onClick={goBack}>
      <IconWrapper icon="LeftArrow" />
    </div>
  );
};

export default BackButton;
