import React, { Component } from "react";
import { IntlProvider } from "react-intl";
import FallBackPage from "../../common/components/FallBackPage/FallBackPage";
import { flattenMessages } from "../../utils/messagesUtils";
import BrandingService from "../BrandingService";
import { BrandingContext } from "./BrandingContext";
import StylingProvider from "./StylingProvider";
import { persistor, store } from "../../reduxToolkit/store";
import getCSUserMeta from "../../utils/getCSUserMeta";
import axiosCSPrivateInstance from "../../axios/axiosCSPrivateInstance";
import { RESET_NOTIFICATION_TOP_BAR } from "../../common/redux/notificationTopBarSlice";
import generateCSTokenAndSSTokenAndLoadCSConfig from "../../utils/generateCSTokenAndSSTokenAndLoadCSConfig";
import getConfigJson from "../../utils/getConfigJson";
import { REMOVE_AUTH_STATE } from "../../modules/auth/redux/authSlice";

class BrandingProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: { isDefault: true },
      messages: { isDefault: true },
      isLoading: true,
      jsonConfig: {},
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);

    const encodedEmailUrlParam = !!urlParams.get("user")
      ? decodeURIComponent(urlParams.get("user"))
      : localStorage.getItem("user");

    const isSSOUrlParam = !!urlParams.get("is_sso")
      ? urlParams.get("is_sso")
      : localStorage.getItem("isSSOLogin");

    const redirectUrlParam = !!urlParams.get("redirect_url")
      ? decodeURIComponent(urlParams.get("redirect_url"))
      : localStorage.getItem("redirectUrl");

    const brandIdUrlParam = !!urlParams.get("brand_id")
      ? decodeURIComponent(urlParams.get("brand_id"))
      : localStorage.getItem("brandId");

    const brandNameUrlParam = !!urlParams.get("brand_name")
      ? decodeURIComponent(urlParams.get("brand_name"))
      : localStorage.getItem("brandName");

    const metaUrlParam = !!urlParams.get("meta")
      ? decodeURIComponent(urlParams.get("meta"))
      : localStorage.getItem("meta");

    console.log("metaUrlParam", metaUrlParam)
    console.log("urlParams", urlParams)

    const isSSOLoginUrlParam =
      isSSOUrlParam === "1" || isSSOUrlParam === "true";

    if (isSSOLoginUrlParam) {
      localStorage.setItem("isSSOLogin", "true");
    } else {
      localStorage.setItem("isSSOLogin", "false");
    }
    if (!!encodedEmailUrlParam) {
      localStorage.setItem("user", encodedEmailUrlParam);
    }
    if (!!redirectUrlParam) {
      localStorage.setItem("redirectUrl", redirectUrlParam);
    }
    if (!!brandIdUrlParam) {
      localStorage.setItem("brandId", brandIdUrlParam);
    }
    if (!!brandNameUrlParam) {
      localStorage.setItem("brandName", brandNameUrlParam);
    }
    if (!!metaUrlParam) {
      localStorage.setItem("meta", metaUrlParam);
    }

    const encodedEmail = encodedEmailUrlParam;
    const redirectUrl = redirectUrlParam;
    const isSSOLogin = isSSOLoginUrlParam;
    const brandId = brandIdUrlParam;
    const brandName = brandNameUrlParam;
    const meta = atob(metaUrlParam);

    BrandingService.get().then(async (result) => {
      console.log("result****", result);
      if (!result) return;
      const { modules, messages, theme, jsonConfig } = result;
      const { CSToken, authMeta } = getCSUserMeta();

      const decodedBase64 = decodeURIComponent(encodedEmail);
      const decodedEmail = atob(decodedBase64);

      // console.log(`localStorage.getItem("user")`, localStorage.getItem("user"));
      // console.log(
      //   `localStorage.getItem("redirectUrl")`,
      //   localStorage.getItem("redirectUrl")
      // );
      // console.log("user", encodedEmail);
      // console.log("redirectUrl", redirectUrl);

      console.log("CSToken", CSToken);
      console.log("authMeta?.username", authMeta?.username);
      console.log("decodedEmail only", decodedEmail?.split(",")?.[0]);
      console.log("meta", meta);

      const expiryDate = new Date(meta);
      const currentDate = new Date();
      const timediffToCheckInhrs = parseInt(jsonConfig.LOGOUTTIME);
      console.log("timechk: ", timediffToCheckInhrs);
      const timediffToCheckInMs = timediffToCheckInhrs * 60 * 60 * 1000;//in ms
      const diff = expiryDate?.getTime() - currentDate.getTime();



      console.log("expiryDate", expiryDate);
      console.log("currentDate", currentDate);
      console.log("timediffToCheckInMs", timediffToCheckInMs);
      console.log("diff", diff > timediffToCheckInMs)

      //if (!meta || isNaN(expiryDate) || expiryDate?.getTime() <= currentDate.getTime()) {

      if (!meta || isNaN(expiryDate) || (diff > timediffToCheckInMs)) {
        console.log("logging out token is expired");
        const dispatch = store.dispatch;
        let { brandMeta } = getCSUserMeta();
        dispatch(REMOVE_AUTH_STATE());
        dispatch(RESET_NOTIFICATION_TOP_BAR());

        // Dispatch the action to reset the in-memory redux store
        dispatch({ type: "RESET" });

        // Purge the persisted state from storage (localStorage)
        persistor
          .purge()
          .then(() => {
            console.log("Persisted state has been purged");
          })
          .finally(() => {
            window.open(
              `${brandMeta?.redirectUrl ||
              (process.env.NODE_ENV === "development"
                ? "http://localhost:3099"
                : jsonConfig?.MUSIC_BANK_DOMAIN)
              }/#/logout?cs-logout=true`,
              "_self"
            );
          });
        return;
      }

      let checkIfTokenValid = false;

      // if (
      //   !CSToken ||
      //   authMeta?.username !== decodedEmail?.split(",")?.[0] ||
      //   !checkIfTokenValid
      // ) {
      await generateCSTokenAndSSTokenAndLoadCSConfig(
        process.env.NODE_ENV === "development"
          ? process.env.REACT_APP_DEV_SS_DOMAIN
          : jsonConfig?.MUSIC_BANK_DOMAIN,
        encodedEmail,
        redirectUrl,
        isSSOLogin,
        brandId,
        brandName
      );
      // }

      // if (CSToken) {
      //   try {
      //     let tokenData = await axiosCSPrivateInstance.get(`/user/getUserData`);
      //     if (!!tokenData?.data?.id) {
      //       checkIfTokenValid = true;
      //       this.setState({
      //         config: { modules },
      //         theme,
      //         jsonConfig,
      //         messages,
      //         isLoading: false,
      //       });
      //       return;
      //     } else {
      //       checkIfTokenValid = false;
      //     }
      //   } catch (error) {
      //     checkIfTokenValid = false;
      //     console.log("error", error);
      //   }
      // }

      if (!checkIfTokenValid) {
        store.dispatch(RESET_NOTIFICATION_TOP_BAR());
      }

      this.setState({
        config: { modules },
        theme,
        jsonConfig,
        messages,
        isLoading: false,
      });
    });
  }

  renderLoading() {
    return <FallBackPage />;
  }

  render() {
    const { children } = this.props;
    const { isLoading, theme, messages } = this.state;
    if (isLoading) {
      return this.renderLoading();
    }
    return (
      <BrandingContext.Provider value={this.state}>
        <IntlProvider locale="en" messages={flattenMessages(messages)}>
          <StylingProvider stylingVariables={theme}>{children}</StylingProvider>
        </IntlProvider>
      </BrandingContext.Provider>
    );
  }
}

export default BrandingProvider;
