import React from "react";
import Layout from "../../../../common/components/layout/Layout";
import "./UnauthorizedPage.css";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useConfig } from "../../../../customHooks/useConfig";

const UnauthorizedPage = () => {
  let { jsonConfig } = useConfig();

  return (
    <Layout hideNavLinks={true}>
      <div className="unauthorizedPage_wrapper">
        <div className="header_container">
          <p className="sub_header highlight_text">Account is not authorized</p>
          <ButtonWrapper
            style={{ marginTop: "10px" }}
            onClick={() => {
              let { brandMeta } = getCSUserMeta();
              window.open(
                `${
                  brandMeta?.redirectUrl ||
                  (process.env.NODE_ENV === "development"
                    ? "http://localhost:3099"
                    : jsonConfig?.MUSIC_BANK_DOMAIN)
                }/#/logout?cs-logout=true`,
                "_self"
              );
            }}
          >
            Login
          </ButtonWrapper>
        </div>
      </div>
    </Layout>
  );
};

export default UnauthorizedPage;
