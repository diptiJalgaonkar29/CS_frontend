import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./NavLinks.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useSelector } from "react-redux";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { FormattedMessage } from "react-intl";
import { useConfig } from "../../../../customHooks/useConfig";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import { checkSSAccess } from "../../../../utils/checkAppAccess";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import HelpMenu from "../../HelpMenu/HelpMenu";
import ProfileMenu from "../../ProfileMenu/ProfileMenu";

const LinkTitleByAppType = ({ appType }) => {
  switch (appType) {
    case APP_TYPES.AI_VOICE:
      return <FormattedMessage id="navbar.navItems.onlyVoiceCreationStation" />;
    case APP_TYPES.AI_MUSIC:
      return <FormattedMessage id="navbar.navItems.onlyMusicCreationStation" />;
    default:
      return <FormattedMessage id="navbar.navItems.creationStation" />;
  }
};

const NavLinks = () => {
  const { authMeta, brandMeta } = useSelector((state) => state.auth);
  const { appAccess } = useSelector((state) => state.auth);
  const { config, jsonConfig } = useConfig();
  console.log("config:", config, "jsonConfig:", jsonConfig);
  const { appType } = useAppType();
  const navigate = useNavigate();
  const { projectID } = useSelector((state) => state.projectMeta);
  const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);
  const { cueID } = useSelector((state) => state.AIMusic);

  let navMeta = [
    {
      label: <FormattedMessage id="navbar.navItems.workSpace" />,
      to: getWorkSpacePath(projectID, cueID),
    },
    {
      label: <FormattedMessage id="navbar.navItems.myProject" />,
      to: NavStrings.PROJECTS,
    },
    {
      label: <LinkTitleByAppType appType={appType} />,
      to: NavStrings.HOME,
      id: "home_nav_link",
    },
  ];

  if (!authMeta?.status) return;

  const showLogout = !brandMeta?.isSSOLogin || config?.modules?.SHOW_SSO_LOGOUT;
  return (
    <nav className="nav_links_container">
      <div className="nav_links_left_container">
        {checkSSAccess() && (
          <div
            className={`nav_link inactive_nav_link`}
            onClick={async () => {
              localStorage.setItem("currentUseThisTrack", `${projectID}-${currentUseThisTrack}`)
              window.open(
                `${
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3099"
                    : jsonConfig?.MUSIC_BANK_DOMAIN
                }`,
                "_self"
              );
            }}
          >
            <FormattedMessage id="navbar.navItems.sonicSpaceHome"></FormattedMessage>
          </div>
        )}
        {navMeta?.map((data, index) => {
          return (
            <NavLink
              key={"nav_link_" + index}
              to={data.to}
              id={data.id || ""}
              className={({ isActive }) =>
                `${isActive ? "active_nav_link" : "inactive_nav_link"} nav_link`
              }
            // onClick={e => isDisabled && e.preventDefault()}
            >
              {data.label}
            </NavLink>
          );
        })}
        {appAccess?.PREDICT_ACCESS && (
          <div
            className={`nav_link inactive_nav_link ${window.globalConfig?.PREDICT_BASE_URL ? "" : "disabled_nav_link"
              }`}
            onClick={async () => {
              localStorage.setItem("currentUseThisTrack", `${projectID}-${currentUseThisTrack}`)
              window.open(
                `${process.env.NODE_ENV === "development"
                  ? "http://localhost:3099/#/predict/"
                  : jsonConfig?.MUSIC_BANK_DOMAIN + "/#/predict/"
                }`,
                "_self"
              );
            }}
          >
            <FormattedMessage id="navbar.navItems.Predict"></FormattedMessage>
          </div>
        )}
        {appAccess?.MONITOR_ACCESS && (
          <div
            className={`nav_link inactive_nav_link ${
              window.globalConfig?.MONITOR_BASE_URL ? "" : "disabled_nav_link"
            }`}
            onClick={() => {
              if (!!window.globalConfig?.MONITOR_BASE_URL) {
                window.open(window.globalConfig?.MONITOR_BASE_URL);
              }
            }}
          >
            <FormattedMessage id="navbar.navItems.Monitor"></FormattedMessage>
          </div>
        )}
      </div>
      <div className="nav_links_right_container">
        <HelpMenu showReportEnquiryModal={true} />
        <ProfileMenu showLogout={showLogout} showProfile={true} />
        {/* {showLogout && (
          <div
            className={`nav_link inactive_nav_link`}
            onClick={async () => {
              navigate(NavStrings.LOGOUT);
            }}
          >
            <IconWrapper icon="Logout" className="logout_icon" />
          </div>
        )} */}
      </div>
    </nav>
  );
};

export default NavLinks;
