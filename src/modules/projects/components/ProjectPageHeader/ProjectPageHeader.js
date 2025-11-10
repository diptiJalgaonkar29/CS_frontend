import React, { useState } from "react";
import { ReactComponent as Archive } from "../../../../static/projects_Page/archive.svg";
import { ReactComponent as DownArrow } from "../../../../static/common/downArrow.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useNavigate } from "react-router-dom";
import "./ProjectPageHeader.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import SearchInputWrapper from "../../../../branding/componentWrapper/SearchInputWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";

const ProjectPageHeader = ({
  selectedProjectType,
  setSelectedProjectType,
  viewType,
  setViewType,
  searchQuery,
  setSearchQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { appType } = useAppType();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const projectMenuItems = [
    {
      menuTitle: "My Projects",
      onClick: () => {
        setSelectedProjectType("My Projects");
        handleClose();
      },
      icon: (
        <IconWrapper
          icon={"GridView"}
          width="18"
          height="16"
          fill="var(--color-white)"
        />
      ),
    },
    {
      menuTitle: "Archive",
      onClick: () => {
        setSelectedProjectType("Archive");
        handleClose();
      },
      icon: (
        <IconWrapper
          icon={"Archive"}
          width="18"
          height="16"
          fill="var(--color-white)"
        />
      ),
    },
  ];

  const createProject = (appType) => {
    switch (appType) {
      case APP_TYPES.AI_VOICE:
        navigate(NavStrings.PROJECT_SETTINGS);
        return;
      case APP_TYPES.AI_MUSIC:
        navigate(NavStrings.PROJECT_SETTINGS);
        return;
      default:
        navigate(NavStrings.CS_OPTIONS);
        return;
    }
  };

  return (
    <>
      <div className="page_header">
        <p className="page_header_option boldFamily" onClick={handleClick}>
          {selectedProjectType}
          <DownArrow />
        </p>
        <Menu
          id="project_menu_dropdown"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {projectMenuItems.map((data) => (
            <MenuItem
              className="project_menu_item"
              onClick={data.onClick}
              key={data.menuTitle}
            >
              {data.icon}
              {data.menuTitle}
            </MenuItem>
          ))}
        </Menu>
        <div className="page_header_viewType_Add">
          <div onClick={() => setViewType("List")}>
            <IconWrapper
              icon="ListView"
              width="24"
              height="20"
              className={
                viewType === "List"
                  ? "active_project_view"
                  : "inactive_project_view"
              }
            />
          </div>
          <div onClick={() => setViewType("Grid")}>
            <IconWrapper
              icon="GridView"
              width="24"
              height="20"
              className={
                viewType === "Grid"
                  ? "active_project_view"
                  : "inactive_project_view"
              }
            />
          </div>
          <ButtonWrapper
            variant="filled"
            onClick={() => {
              createProject(appType);
            }}
          >
            + New Project
          </ButtonWrapper>
        </div>
      </div>
      <div className="page_search_bar">
        <SearchInputWrapper
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          setValue={setSearchQuery}
        />
      </div>
      {selectedProjectType === "Archive" && (
        <p className="archive_note">
          Deleted projects stay in Archive for <span>90 days.</span>
        </p>
      )}
    </>
  );
};

export default ProjectPageHeader;
