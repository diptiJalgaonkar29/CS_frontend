import React, { useEffect, useState } from "react";
import "./ProjectGridItem.css";
import coverImgDefault1 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault1.svg";
import coverImgDefault2 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault2.svg";
import coverImgDefault3 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault3.svg";
import coverImgDefault4 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault4.svg";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import { Divider, Menu, MenuItem } from "@mui/material";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

export default function ProjectGridItem({
  projectItem,
  projectType = "My Projects",
  onProjectClick = () => {},
  onDeleteClick = () => {},
  onRestoreClicked = () => {},
  openEditClick = () => {},
}) {
  const { project_id, project_name, assets, cover_image } = projectItem;

  const [isLoading, setIsLoading] = useState(!!cover_image);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (cover_image) {
      getProjectCoverImage(cover_image);
    } else {
      setImgSrc(getRandomCoverImage());
    }
  }, [cover_image]);

  let randomCoverImageArr = [
    coverImgDefault1,
    coverImgDefault2,
    coverImgDefault3,
    coverImgDefault4,
  ];
  const [showActionMenu, setActionMenu] = useState(null);
  const open = Boolean(showActionMenu);

  const handleClose = () => {
    setActionMenu(null);
  };

  const getProjectCoverImage = (coverImgFileName) => {
    axiosCSPrivateInstance(`/video/getVideoCoverImg/${coverImgFileName}`, {
      responseType: "blob",
    })
      .then((response) => {
        if (response?.data?.type?.includes("image/")) {
          const url = window.URL.createObjectURL(response?.data);
          setImgSrc(url);
        } else {
          setImgSrc(getRandomCoverImage());
        }
      })
      .catch((error) => {
        console.log("error", error);
        setImgSrc(getRandomCoverImage());
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getRandomCoverImage = () => {
    let randomInt = project_id % 4;
    return randomCoverImageArr[randomInt];
  };

  return (
    <>
      {projectType === "My Projects" ? (
        <IconWrapper
          icon="More"
          className="edit_delete_action_menu_icon"
          onClick={(e) => setActionMenu(e.currentTarget)}
        />
      ) : (
        <div className="grid_archive_btn_container">
          <ButtonWrapper
            size="s"
            variant="filled"
            style={{ zIndex: 1, position: "relative" }}
            onClick={onRestoreClicked}
          >
            Restore
          </ButtonWrapper>
        </div>
      )}
      <div className="project_grid_content">
        <Menu
          id="edit_delete_action_menu"
          anchorEl={showActionMenu}
          open={open}
          onClose={() => {
            setActionMenu(false);
          }}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            onClick={() => {
              openEditClick();
              handleClose();
            }}
          >
            <IconWrapper icon="Edit" className="edit_icon" />
            <span>Edit Information</span>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onDeleteClick();
              handleClose();
            }}
            style={{ color: "#F35A6C" }}
          >
            <IconWrapper
              icon="Trash"
              fill={"#F35A6C"}
              className="project_grid_Delete"
            />
            <span>Delete Project</span>
          </MenuItem>
        </Menu>
        <div className="img_container">
          {/* <img
            loading="lazy"
            src={
              cover_image
                ? getProjectCoverImage(cover_image, project_id)
                : getRandomCoverImage()
            }
            id={`project_grid_item_cover_image_${project_id}`}
            onError={() => {
              let imgElement = document.getElementById(
                `project_grid_item_cover_image_${project_id}`
              );
              imgElement.src = getRandomCoverImage();
            }}
            alt="_"
          /> */}
          {isLoading ? (
            <div className="loading_cover_image" />
          ) : (
            <img
              loading="lazy"
              src={imgSrc}
              id={`project_grid_item_cover_image_${project_id}`}
              onError={(e) => {
                setIsLoading(false);
                setImgSrc(getRandomCoverImage());
                e.target.onerror = null;
              }}
              alt="_"
            />
          )}
        </div>
        <div className="projectName_ellipsis_container">
          <CustomToolTip title={project_name}>
            <div
              className={`projectName_ellipsis boldFamily ${projectType.replace(
                " ",
                "_"
              )}`}
              onClick={
                projectType === "My Projects" ? onProjectClick : () => {}
              }
            >
              {project_name}
            </div>
          </CustomToolTip>
        </div>
      </div>
      <p className="project_grid_asset">{assets || "-"}</p>
    </>
  );
}
