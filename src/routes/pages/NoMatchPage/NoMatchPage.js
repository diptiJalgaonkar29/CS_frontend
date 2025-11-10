import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../common/components/layout/Layout";
import NavStrings from "../../constants/NavStrings";
import "./NoMatchPage.css";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";

const NoMatchPage = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="no_url_match_wrapper">
        <div className="header_container">
          <p className="sub_header highlight_text">
            No match found for the requested url
          </p>
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
    </Layout>
  );
};

export default NoMatchPage;
