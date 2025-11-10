import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
// import IconButtonWrapper from "../../../../branding/componentWrapper/IconButtonWrapper";
// import ReportBug from "../../ReportBug/ReportBug";
import "./HelpMenu.css";
import MenuWrapper from "../../../branding/componentWrapper/MenuWrapper/MenuWrapper";
import MenuItemWrapper from "../../../branding/componentWrapper/MenuWrapper/MenuItemWrapper";
import { Divider } from "@mui/material";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import CustomToolTip from "../customToolTip/CustomToolTip";
import { useConfig } from "../../../customHooks/useConfig";
import ReportBug from "../ReportBug/ReportBug";
import IconButtonWrapper from "../../../branding/componentWrapper/IconButtonWrapper";

const HelpMenu = ({ showReportEnquiryModal }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  let { jsonConfig } = useConfig();
  const navigate = useNavigate();

  let pageHash = window.location.hash;

  return (
    <>
      <div
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className={`${
          isMobile ? "MobileNavbar--anchor" : "WebNavbar--anchor"
        } ${
          [
            "#/documents/guidelines",
            "#/documents/templates",
            "#/documents/faq",
          ].includes(pageHash)
            ? "activeNavlink"
            : ""
        }`}
      >
        <CustomToolTip title={"Help and Resources"}>
          <IconButtonWrapper icon="Help" className="help_icon" />
        </CustomToolTip>
      </div>
      <MenuWrapper
        id="search_menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {showReportEnquiryModal && (
          <MenuItemWrapper>
            <ReportBug />
            <Divider style={{ backgroundColor: "var(--color-canvas-light)" }} />
          </MenuItemWrapper>
        )}
        <MenuItemWrapper
          onClick={() =>
            window.open(
              `${
                process.env.NODE_ENV === "development"
                  ? "http://localhost:3099"
                  : jsonConfig?.MUSIC_BANK_DOMAIN
              }/#/documents/guidelines`,
              "_self"
            )
          }
        >
          <FormattedMessage id={"navbar.navItems.documents"} />
        </MenuItemWrapper>
      </MenuWrapper>
    </>
  );
};

export default HelpMenu;
