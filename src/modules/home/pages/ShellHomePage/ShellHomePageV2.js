import { useNavigate } from "react-router-dom";
import "./ShellHomePageV2.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import Layout from "../../../../common/components/layout/Layout";
import { FormattedMessage } from "react-intl";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import { Fragment, useEffect, useState } from "react";
import FallBackPage from "../../../../common/components/FallBackPage/FallBackPage";
import MostPopularVoice from "../../components/MostPopularVoice/MostPopularVoice";
import OnBrandVoice from "../../components/OnBrandVoice/OnBrandVoice";
import HomeProjectList from "../../components/HomeProjectList/HomeProjectList";
import { ReactComponent as NewRightArrow } from "../../../../static/common/NewRightArrow.svg";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import {
  ASSET_PATHS,
  getBrandAssetBaseUrl,
  getBrandAssetPath,
} from "../../../../utils/getBrandAssetMeta";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import Cookies from "js-cookie";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import { brandConstants } from "../../../../utils/brandConstants";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import {
  checkAIMusicCreateAccess,
  checkAIVoiceAccess,
} from "../../../../utils/checkAppAccess";
import { useDispatch } from "react-redux";
import { ReactComponent as Music } from "../../../../static/AI_music/AI_music.svg";
import { ReactComponent as Voice } from "../../../../static/common/voice.svg";
import { SET_PROJECT_META } from "../../../workSpace/redux/projectMetaSlice";
import getBrandName from "../../../../utils/getBrandName";

const SubTitleByAppType = ({ appType }) => {
  switch (appType) {
    case APP_TYPES.AI_VOICE:
      return <FormattedMessage id="home.page.onlyVoiceTitleSubtextHighlight" />;
    case APP_TYPES.AI_MUSIC:
      return <FormattedMessage id="home.page.onlyMusicTitleSubtextHighlight" />;
    default:
      return <FormattedMessage id="home.page.titleSubtextHighlight" />;
  }
};

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

var crationStationOptions = [
  {
    label: "AI Music",
    isEnabled: checkAIMusicCreateAccess(),
    icon: <Music />,
  },
  {
    label: "Voice",
    isEnabled: checkAIVoiceAccess(),
    icon: <Voice />,
  },
]?.filter((data) => data?.isEnabled);

const ShellHomePageV2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  let { authMeta } = getCSUserMeta();

  useEffect(() => {
    let user_id = String(authMeta?.user_id);
    let cookieKey = `${user_id}-is-first-login`;
    let cookieValue = Cookies.get(cookieKey);
    console.log("cookieValue", cookieValue);
    console.log("cookieKey", cookieKey);
    console.log("user_id", user_id);

    if (!cookieValue || cookieKey.split("-")[0] !== user_id) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  // const { appType } = useAppType();

  // function createProject(appType) {
  //   switch (appType) {
  //     case APP_TYPES.AI_VOICE:
  //       navigate(NavStrings.PROJECT_SETTINGS);
  //       return;
  //     case APP_TYPES.AI_MUSIC:
  //       navigate(NavStrings.PROJECT_SETTINGS);
  //       return;
  //     default:
  //       navigate(NavStrings.CS_OPTIONS);
  //       return;
  //   }
  // }

  let pathnameToRedirectAfterLogin = localStorage.getItem("pathname");
  // console.log("pathnameToRedirectAfterLogin", pathnameToRedirectAfterLogin);

  useEffect(() => {
    if (!!pathnameToRedirectAfterLogin) {
      localStorage.removeItem("pathname");
      navigate(pathnameToRedirectAfterLogin);
    }
  }, [pathnameToRedirectAfterLogin]);

  if (!!pathnameToRedirectAfterLogin) {
    return <FallBackPage />;
  }

  const handleClose = () => {
    setOpen(false);
    Cookies.set(`${authMeta?.user_id}-is-first-login`, false, {
      path: "/",
      SameSite: "Strict",
      expires: 365,
    });
  };

  const headerLogo = (
    <div className="is-first-login_modal_header">
      <img
        src={getBrandAssetPath(ASSET_PATHS?.NAV_LOGO_PATH)}
        className="navbar_img"
        alt="logo"
      />
      <span>Terms Of Use</span>
    </div>
  );

  function createProject(label) {
    // if (label === "AI Music") {
    //     navigate(NavStrings.WORKSPACE_AI_MUSIC_GENERATOR);
    // } else {
    // }
    navigate(NavStrings.PROJECT_SETTINGS);
    dispatch(SET_PROJECT_META({ activeWSTab: label }));
  }

  return (
    <Layout>
      <div className="shellhomeV2_container">
        <div>
          <p className="header boldFamily">Shell AI Voice Generator</p>
          <p className="sub_header">
            An advanced AI-powered tool for natural and expressive speech
            synthesis.
          </p>
        </div>
        <p className="section_header">
          <IconWrapper icon="AddBordered" /> Start your project with
        </p>
        <div className="homeV2_option_container">
          {crationStationOptions?.map(({ icon, label }) => (
            <Fragment key={label}>
              <div
                className={`homeV2_option`}
                onClick={() => {
                  createProject(label);
                }}
              >
                {icon}
                <div className="homeV2_option_title">{label}</div>
              </div>
            </Fragment>
          ))}
        </div>
        <HomeProjectList />
      </div>
      {window.globalConfig?.SHOW_MODAL_AFTER_FIRST_LOGIN && (
        <ModalWrapper
          isOpen={open}
          onClose={handleClose}
          title={headerLogo}
          aria-labelledby="footer-dialog-title"
          className="footer-dialog is-first-login_modal"
        >
          <iframe
            src={`${getBrandAssetBaseUrl()}/html/termsOfUseShell.html`}
            className="footer_modal_iframe is-first-login_iframe"
          />
          <div className="footer_modal_container is-first-login_modal_container">
            {/* <ButtonWrapper onClick={handleClose}>
                Decline
              </ButtonWrapper> */}
            <ButtonWrapper onClick={handleClose} variant="filled">
              Accept
            </ButtonWrapper>
          </div>
        </ModalWrapper>
      )}
    </Layout>
  );
};
export default ShellHomePageV2;
