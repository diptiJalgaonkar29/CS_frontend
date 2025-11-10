import React from "react";
import { useConfig } from "../../../customHooks/useConfig";
import "./FallBackPage.css";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";

const FallBackPage = () => {
  let { config } = useConfig();
  return (
    <div className="fall_back_container">
      {/* <img
        src={config?.assets?.fallback?.logo}
        className="fall_back_logo"
        alt="logo"
      /> */}
      <CustomLoaderSpinner />
    </div>
  );
};

export default FallBackPage;
