import React, { useEffect } from "react";
import { useState } from "react";
import "./FooterLinks.css";
import getSuperBrandName from "../../../utils/getSuperBrandName";
import { brandConstants } from "../../../utils/brandConstants";
import ModalWrapper from "../../../branding/componentWrapper/ModalWrapper";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import getConfigJson from "../../../utils/getConfigJson";
import { getBrandAssetBaseUrl } from "../../../utils/getBrandAssetMeta";
import { useConfig } from "../../../customHooks/useConfig";
import { useSelector } from "react-redux";

const superBrandName = getSuperBrandName();

const FooterLinks = () => {
  const [iudendaCookiePolicyId, setIudendaCookiePolicyId] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [iframeMeta, setIframeMeta] = useState({ title: null, link: null });
  const { authMeta } = useSelector((state) => state?.auth);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { jsonConfig } = useConfig();
  useEffect(() => {
    const id = setTimeout(() => {
      setIudendaCookiePolicyId(jsonConfig?.IUBENDA_COOKIE_POLICY_ID);
      setAppVersion(jsonConfig?.APP_VERSION);
    }, 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <a
        className="footer_link"
        onClick={() => {
          if (iudendaCookiePolicyId) {
            setIframeMeta({
              title: "Privacy Policy",
              link: `https://www.iubenda.com/privacy-policy/${iudendaCookiePolicyId}`,
            });
            handleClickOpen();
          } else if (window.globalConfig?.IS_SHELL_BRAND) {
            setIframeMeta({
              title: "Privacy Policy",
              link: `${getBrandAssetBaseUrl()}/html/privacyPolicy.html`,
            });
            handleClickOpen();
          }
        }}
      >
        Privacy Policy
      </a>
      &nbsp;|&nbsp;
      <a
        className="footer_link"
        onClick={() => {
          console.log("iudendaCookiePolicyId", iudendaCookiePolicyId);
          if (iudendaCookiePolicyId) {
            setIframeMeta({
              title: "Terms and Conditions",
              link: `https://www.iubenda.com/terms-and-conditions/${iudendaCookiePolicyId}`,
            });
            handleClickOpen();
          } else if (window.globalConfig?.IS_SHELL_BRAND) {
            setIframeMeta({
              title: "Terms and Conditions",
              link: `${getBrandAssetBaseUrl()}/html/termsAndCondition.html`,
            });
            handleClickOpen();
          }
        }}
      >
        Terms and Conditions
      </a>{" "}
      &nbsp;|&nbsp;
      <a
        className="footer_link"
        onClick={() => {
          if (iudendaCookiePolicyId) {
            setIframeMeta({
              title: "Cookie Policy",
              link: `https://www.iubenda.com/privacy-policy/${iudendaCookiePolicyId}/cookie-policy`,
            });
            handleClickOpen();
          } else if (window.globalConfig?.IS_SHELL_BRAND) {
            setIframeMeta({
              title: "Cookie Policy",
              link: `${getBrandAssetBaseUrl()}/html/cookiePolicy.html`,
            });
            handleClickOpen();
          }
        }}
      >
        Cookie Policy
      </a>
      &nbsp;|&nbsp;
      <span className="footer_link" style={{ cursor: "default" }}>
        {appVersion}
      </span>
      <ModalWrapper
        isOpen={open}
        onClose={handleClose}
        title={iframeMeta.title}
        aria-labelledby="footer-dialog-title"
        className="footer-dialog"
      >
        <iframe src={iframeMeta.link} className="footer_modal_iframe" />
        <div className="footer_modal_container">
          <ButtonWrapper onClick={handleClose} variant="filled">
            Close
          </ButtonWrapper>
        </div>
      </ModalWrapper>
    </>
  );
};

export default FooterLinks;
