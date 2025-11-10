import { useNavigate } from "react-router-dom";
import "./ShellHomePage.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import Layout from "../../../../common/components/layout/Layout";
import { FormattedMessage } from "react-intl";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import { useEffect, useState } from "react";
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

const ShellHomePage = () => {
  const navigate = useNavigate();
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

  return (
    <Layout>
      <div className="shell_home_container">
        <div>
          <p className="header boldFamily">Shell AI Voice Generator</p>
          <p className="sub_header">
            An incredible AI tool to create text to speech
          </p>
        </div>
        <section className="create_project_container">
          <p className="section_header">Create a Project</p>
          <div
            className="create_project_button"
            onClick={() => {
              navigate(NavStrings.CS_OPTIONS);
            }}
          >
            <IconWrapper icon={"AddBordered"} />
          </div>
        </section>
        <p className="section_header">Your Projects</p>
        <div className="home_projectList_Container">
          <HomeProjectList />
          <button
            onClick={() => {
              navigate(NavStrings.PROJECTS);
            }}
            className="AllProjectButton"
          >
            {" "}
            <p>All Projects </p>
            <NewRightArrow id="rightArrow_btn" />
          </button>
        </div>
        {/* <MostPopularVoice />
        <OnBrandVoice /> */}
        {/* <button
          onClick={() => {
            navigate(NavStrings.CS_OPTIONS);
          }}
          className="NewProjectButton"
        >
          Create a New Project
        </button> */}
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
export default ShellHomePage;
