import axios from "axios";
import { RESET_NOTIFICATION_TOP_BAR } from "../common/redux/notificationTopBarSlice";
import {
  REMOVE_AUTH_STATE,
  SET_AUTH_META,
} from "../modules/auth/redux/authSlice";
import getSuperBrandId from "./getSuperBrandId";
import { store } from "../reduxToolkit/store";
import Cookies from "js-cookie";
import { setLoginStatusChecker } from "./tokenExpiry";

import getSuperBrandName from "./getSuperBrandName";

const addSuperBrandNameClassToBodyElement = (superBrandName) => {
  try {
    let isSuperBrandClassNameAddedToBody =
      document.body.classList.contains(superBrandName);
    if (!isSuperBrandClassNameAddedToBody) {
      document.body.classList.add(superBrandName);
    }
  } catch (error) {}
};

const addBrandNameClassToBodyElement = (brandName) => {
  try {
    console.log("addBrandNameClassToBodyElement brandName : ", brandName);
    let isBrandClassNameAddedToBody =
      document.body.classList.contains(brandName);
    if (!isBrandClassNameAddedToBody) {
      document.body.classList.add(brandName);
    }
  } catch (error) {}
};

const generateCSTokenAndSSTokenAndLoadCSConfig = async (
  ssDomain,
  encodedEmail,
  redirectUrl,
  isSSOLogin,
  brandId,
  brandName
) => {
  try {
    console.log("brandName", brandName);
    // console.log("encodedEmail", encodedEmail);
    // console.log("redirectUrl", redirectUrl);
    // console.log("!encodedEmail || !redirectUrl", !encodedEmail || !redirectUrl);
    if (!encodedEmail || !redirectUrl) {
      store.dispatch(REMOVE_AUTH_STATE());
      store.dispatch(RESET_NOTIFICATION_TOP_BAR());
      return;
    }
    let superBrandId = getSuperBrandId();
    let superBrandName = getSuperBrandName();
    console.log("superBrandName", superBrandName);
    addSuperBrandNameClassToBodyElement(superBrandName);
    console.log("brandName", brandName);
    if (!!brandName) {
      addBrandNameClassToBodyElement(
        brandName?.replaceAll(" ", "")?.toLowerCase()
      );
    }

    let ssDomainPath =
      process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_DEV_SS_DOMAIN
        : ssDomain;

    const CStoken = await axios.get(
      `${ssDomainPath}/api/users/generateToken?user=${encodedEmail}`,
      {
        headers: {
          Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
          BrandName: superBrandId,
          BrandId: brandId,
        },
      }
    );

    const SStoken = await axios.get(
      `${window.location.origin}/api/user/ss_token`,
      {
        headers: {
          Authorization: `Bearer ${CStoken?.data?.token}`,
          "Content-Type": "application/json",
          BrandName: superBrandId,
          BrandId: brandId,
        },
      }
    );

    const now = new Date();
    const tokenExpiryDate = new Date(
      now.getTime() + SStoken?.data?.expires_in * 1000
    );
    console.log("tokenExpiryDate", tokenExpiryDate);

    Cookies.set("mu-logstatus", tokenExpiryDate, {
      expires: tokenExpiryDate,
      path: "/",
      SameSite: "Strict",
    });
    // setLoginStatusChecker();

    const userMeta = await axios.get(
      `${ssDomainPath}/api/users/csUserData?user=${encodedEmail}`,
      {
        headers: {
          Authorization: `Bearer ${SStoken?.data?.access_token}`,
          "Content-Type": "application/json",
          BrandName: superBrandId,
          BrandId: brandId,
        },
      }
    );

    store.dispatch(
      SET_AUTH_META({
        CSToken: CStoken?.data?.token,
        SSToken: SStoken?.data?.access_token,
        authMeta: {
          username: userMeta?.data?.email,
          fullName: userMeta?.data?.full_name,
          id: 0,
          status: true,
          user_id: SStoken?.data?.user_id,
          userRole: SStoken?.data?.user_roles?.[0],
          brandId,
          brandName,
        },
        appAccess: {
          AI_MUSIC: userMeta?.data?.aimusic_access,
          AI_VOICE: userMeta?.data?.aivoice_access,
          SS_ACCESS: userMeta?.data?.ss_access,
          PREDICT_ACCESS: userMeta?.data?.predict,
          MONITOR_ACCESS: userMeta?.data?.monitor,
          AI_MUSIC_CREATE: userMeta?.data?.aiMusicCreateAccess,
          AI_MUSIC_EDIT: userMeta?.data?.aiMusicEditAccess,
          AI_MUSIC_VARIANT: userMeta?.data?.aiMusicGetVariantAccess,
        },
        brandMeta: {
          musicBankBrandName: userMeta?.data?.musicBankBrandName,
          tuneyBrandName: userMeta?.data?.tuneyBrandName,
          aiMusicProvider: userMeta?.data?.aiMusicProvider,
          // musicBankBrandName: "Vodafone",
          // tuneyBrandName: "Vodafone",
          isPersonalizedTrackingAllowed:
            userMeta?.data?.isPersonalizedTrackingAllowed,
          SSDomainPath: ssDomainPath,
          redirectUrl,
          profanity: userMeta?.data?.profanityEnabled ?? false,
          isSSOLogin,
        },
      })
    );

    return CStoken?.data?.token;
  } catch (error) {
    console.log("generateCSTokenAndSSTokenAndLoadCSConfig error :: ", error);
  }
};

export default generateCSTokenAndSSTokenAndLoadCSConfig;
