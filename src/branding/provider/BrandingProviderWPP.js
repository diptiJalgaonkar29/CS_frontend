import React, { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { flattenMessages } from "../../utils/messagesUtils";
import BrandingService from "../BrandingService";
import { BrandingContext } from "./BrandingContext";
import StylingProvider from "./StylingProvider";
import getSuperBrandName from "../../utils/getSuperBrandName";
import getWPPThemeJson from "../wpp/theme/getWPPThemeJson";
import FallBackPage from "../../common/components/FallBackPage/FallBackPage";
import getCSUserMeta from "../../utils/getCSUserMeta";
import getSuperBrandId from "../../utils/getSuperBrandId";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  REMOVE_AUTH_STATE,
  SET_AUTH_META,
} from "../../modules/auth/redux/authSlice";
import axiosCSPrivateInstance from "../../axios/axiosCSPrivateInstance";
import { RESET_NOTIFICATION_TOP_BAR } from "../../common/redux/notificationTopBarSlice";
import { brandConstants } from "../../utils/brandConstants";
import generateCSTokenAndSSTokenAndLoadCSConfig from "../../utils/generateCSTokenAndSSTokenAndLoadCSConfig";
import getConfigJson from "../../utils/getConfigJson";
import "@wppopen/components-library/dist/platform-ui-kit/wpp-theme.css";
const BrandingProviderWPP = ({ children }) => {
  const [config, setConfig] = useState({ isDefault: true });
  const [messages, setMessages] = useState({ isDefault: true });
  const [jsonConfig, setJsonConfig] = useState({ isDefault: true });
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState({});
  const dispatch = useDispatch();

  let brandname = getSuperBrandName();

  let shouldUseOsContext =
    brandname === brandConstants.WPP && process.env.NODE_ENV === "production";

  const generateCSToken = async (
    ssDomain,
    encodedEmail,
    redirectUrl,
    isSSOLogin
  ) => {
    if (!encodedEmail || !redirectUrl) {
      dispatch(REMOVE_AUTH_STATE());
      dispatch(RESET_NOTIFICATION_TOP_BAR());
      return;
    }
    let superBrandId = getSuperBrandId();
    console.log("superBrandId", superBrandId);

    let ssDomainPath =
      process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_DEV_SS_DOMAIN
        : ssDomain;

    const token = await axios.get(
      `${ssDomainPath}/api/users/generateToken?user=${encodedEmail}`,
      {
        headers: {
          Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
          BrandName: superBrandId,
          BrandId: localStorage.getItem("brandId"),
        },
      }
    );
    console.log("token", token?.data);

    const userMeta = await axios.get(
      `${ssDomainPath}/api/users/csUserData?user=${encodedEmail}`,
      {
        headers: {
          Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
          "Content-Type": "application/json",
          BrandName: superBrandId,
          BrandId: localStorage.getItem("brandId"),
        },
      }
    );
    console.log("userMeta", userMeta?.data);
    dispatch(
      SET_AUTH_META({
        CSToken: token?.data?.token,
        authMeta: {
          username: userMeta?.data?.email,
          fullName: userMeta?.data?.full_name,
          id: 0,
          status: true,
        },
        appAccess: {
          AI_MUSIC: userMeta?.data?.aimusic_access,
          AI_VOICE: userMeta?.data?.aivoice_access,
          SS_ACCESS: userMeta?.data?.ss_access,
          AI_MUSIC_CREATE: userMeta?.data?.aiMusicCreateAccess,
          AI_MUSIC_EDIT: userMeta?.data?.aiMusicEditAccess,
          AI_MUSIC_VARIANT: userMeta?.data?.aiMusicGetVariantAccess,
        },
        brandMeta: {
          musicBankBrandName: userMeta?.data?.musicBankBrandName,
          tuneyBrandName: userMeta?.data?.tuneyBrandName,
          isPersonalizedTrackingAllowed:
            userMeta?.data?.isPersonalizedTrackingAllowed,
          redirectUrl,
          profanity: userMeta?.data?.profanityEnabled ?? false,
          isSSOLogin: isSSOLogin === "true",
        },
      })
    );
    return token?.data?.token;
  };

  useEffect(() => {
    const loadBrandingData = async () => {
      try {
        setIsLoading(true);

        const jsonConfigMeta = getConfigJson();
        const { CSToken, authMeta } = getCSUserMeta();
        const urlParams = new URLSearchParams(window.location.search);

        const encodedEmailUrlParam = urlParams.get("user")
          ? decodeURIComponent(urlParams.get("user"))
          : localStorage.getItem("user");

        const isSSOUrlParam = urlParams.get("is_sso")
          ? urlParams.get("is_sso")
          : localStorage.getItem("isSSOLogin");

        const redirectUrlParam = urlParams.get("redirect_url")
          ? decodeURIComponent(urlParams.get("redirect_url"))
          : localStorage.getItem("redirectUrl");

        const brandIdUrlParam = urlParams.get("brand_id")
          ? decodeURIComponent(urlParams.get("brand_id"))
          : localStorage.getItem("brandId");

        const isSSOLoginUrlParam =
          isSSOUrlParam === "1" || isSSOUrlParam === "true";

        localStorage.setItem(
          "isSSOLogin",
          isSSOLoginUrlParam ? "true" : "false"
        );
        if (encodedEmailUrlParam)
          localStorage.setItem("user", encodedEmailUrlParam);
        if (redirectUrlParam)
          localStorage.setItem("redirectUrl", redirectUrlParam);
        if (brandIdUrlParam) localStorage.setItem("brandId", brandIdUrlParam);

        const brandNameUrlParam = urlParams.get("brand_name")
          ? decodeURIComponent(urlParams.get("brand_name"))
          : localStorage.getItem("brandName");

        const encodedEmail = encodedEmailUrlParam;
        const redirectUrl = redirectUrlParam;
        const isSSOLogin = isSSOLoginUrlParam;
        const brandId = brandIdUrlParam;
        const brandName = brandNameUrlParam;

        console.log({
          user: encodedEmail,
          redirectUrl,
          isSSOLogin,
          brandId,
          CSToken,
          "authMeta.username": authMeta?.username,
        });

        // ✅ Token validation
        let checkIfTokenValid = false;
        if (CSToken) {
          try {
            const tokenData = await axiosCSPrivateInstance.get(
              `/user/getUserData`
            );
            checkIfTokenValid = !!tokenData?.data?.id;
          } catch (error) {
            console.log("Token validation failed:", error);
            checkIfTokenValid = false;
          }
        }

        const decodedBase64 = decodeURIComponent(encodedEmail);
        const decodedEmail = atob(decodedBase64);

        console.log("Decoded Email:", decodedEmail);
        console.log("Token Valid:", checkIfTokenValid);
        const result = await BrandingService.getWPP();
        console.log("result", result);

        if (!result || !Array.isArray(result) || result.length === 0) {
          console.error("Invalid result from BrandingService.getWPP()");
          setIsLoading(false);
          return;
        }
        // ✅ Safely extract values only after verifying result
        const configResult = result[0]?.module || {};
        const messagesResult = result[0]?.messages || {};
        const config = result[0]?.config || {};
        let themeResult;

        if (
          !CSToken ||
          authMeta?.username !== decodedEmail ||
          !checkIfTokenValid
        ) {
          await generateCSTokenAndSSTokenAndLoadCSConfig(
            process.env.NODE_ENV === "development"
              ? process.env.REACT_APP_DEV_SS_DOMAIN
              : config?.MUSIC_BANK_DOMAIN,
            encodedEmail,
            redirectUrl,
            isSSOLogin,
            brandId,
            brandName
          );
        }

        const csStringThemeData = localStorage.getItem("csThemeData");
        if (shouldUseOsContext && csStringThemeData) {
          try {
            const csJSONThemeData = JSON.parse(csStringThemeData);
            themeResult = getWPPThemeJson(csJSONThemeData);
          } catch (error) {
            console.error("Error parsing csThemeData:", error);
          }
        } else {
          themeResult = result[0]?.theme;
        }

        updateStatesAndCallSetBodyFonts1(
          configResult,
          themeResult,
          messagesResult,
          config
        );
      } catch (error) {
        console.error("Error in Branding useEffect:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandingData();
  }, []);

  const setBodyFonts = () => {
    // console.log("BrandingProviderWPP::setBodyFonts:::config CS", config.fonts);
    var fonts = document.createElement("style");
    fonts.appendChild(document.createTextNode(config.fonts));
    document.head.appendChild(fonts);
  };

  async function updateStatesAndCallSetBodyFonts1(
    configResult,
    themeResult,
    messagesResult,
    jsonConfigMeta
  ) {
    console.log(
      "BrandingProviderWPP CS::updateStatesAndCallSetBodyFonts1:::configResult",
      jsonConfigMeta
    );
    await Promise.all([
      setConfig(configResult),
      setTheme(themeResult),
      setMessages(messagesResult),
      setJsonConfig(jsonConfigMeta),
      setIsLoading(false),
    ]);

    setBodyFonts();
    // console.log(
    //   "BrandingProviderWPP::setBodyFonts:::config CS after",
    //   config.fonts
    // );
  }

  const renderLoading = () => <FallBackPage />;

  if (isLoading) {
    return renderLoading();
  }

  const state = {
    config,
    messages,
    theme,
    jsonConfig,
  };

  return (
    <BrandingContext.Provider value={state}>
      <IntlProvider locale="en" messages={flattenMessages(messages) || {}}>
        <StylingProvider stylingVariables={theme}>{children}</StylingProvider>
      </IntlProvider>
    </BrandingContext.Provider>
  );
};

export default BrandingProviderWPP;
