import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";
import MenuWrapper from "../../../branding/componentWrapper/MenuWrapper/MenuWrapper";
import MenuItemWrapper from "../../../branding/componentWrapper/MenuWrapper/MenuItemWrapper";
import { Divider } from "@mui/material";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import { useConfig } from "../../../customHooks/useConfig";
import NavStrings from "../../../routes/constants/NavStrings";
import { useSelector } from "react-redux";
import IconButtonWrapper from "../../../branding/componentWrapper/IconButtonWrapper";

const ProfileMenu = ({ showProfile, showLogout }) => {
  const [anchorEl, setisMenuOpen] = useState(false);
  const navigate = useNavigate();
  let { jsonConfig } = useConfig();
  const { authMeta } = useSelector((state) => state.auth);

  let pageHash = window.location.hash;

  return (
    <>
      <div
        onClick={(e) => setisMenuOpen(e.currentTarget)}
        className={`${
          isMobile ? "MobileNavbar--anchor" : "WebNavbar--anchor"
        } ${
          ["#/profile/", "#/logout/"].includes(pageHash) ? "activeNavlink" : ""
        }`}
      >
        <IconButtonWrapper icon="Profile" className="profile_icon" />
      </div>
      <MenuWrapper
        id="profile_menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setisMenuOpen(false)}
      >
        {showProfile && !!authMeta?.brandName && (
          <MenuItemWrapper
            style={{
              color: "var(--color-primary) !important",
              fontWeight: "bold",
            }}
            onClick={() =>
              window.open(
                `${
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3099"
                    : jsonConfig?.MUSIC_BANK_DOMAIN
                }/#/select-brand`,
                "_self"
              )
            }
          >
            <FormattedMessage id="navbar.navItems.switchBrand" />
          </MenuItemWrapper>
        )}
        {showProfile && (
          <MenuItemWrapper
            onClick={() =>
              window.open(
                `${
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3099"
                    : jsonConfig?.MUSIC_BANK_DOMAIN
                }/#/profile`,
                "_self"
              )
            }
          >
            <FormattedMessage id={"navbar.navItems.profile"} />
            <Divider style={{ backgroundColor: "var(--color-canvas-light)" }} />
          </MenuItemWrapper>
        )}
        {showLogout && (
          <MenuItemWrapper onClick={() => navigate(NavStrings.LOGOUT)}>
            <FormattedMessage id="navbar.navItems.logout"></FormattedMessage>
          </MenuItemWrapper>
        )}
      </MenuWrapper>
    </>
  );
};

export default ProfileMenu;
