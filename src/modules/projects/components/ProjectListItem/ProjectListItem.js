import React, { useEffect, useState } from "react";
import "./ProjectListItem.css";
import coverImgDefault1 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault1.svg";
import coverImgDefault2 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault2.svg";
import coverImgDefault3 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault3.svg";
import coverImgDefault4 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault4.svg";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import IconButtonWrapper from "../../../../branding/componentWrapper/IconButtonWrapper";

function formatProjectDate(timestamp) {
  if (timestamp !== null) {
    let date = new Date(timestamp);
    try {
      if (date != null) {
        let year = date.getFullYear()?.toString();
        let month = (date.getMonth() + 1)?.toString().padStart(2, "0");
        let day = date.getDate()?.toString().padStart(2, "0");
        return `${day}.${month}.${year}`;
      }
    } catch (error) {
      return "-";
    }
  } else {
    return "-";
  }
}

export default function ProjectListItem({
  projectItem,
  onProjectClick,
  onDeleteClick,
  projectType,
  onRestoreClicked,
  openEditClick,
}) {
  const {
    project_name,
    cover_image,
    project_id,
    description,
    newtimestamp,
    changetimestamp,
    assets,
    deletetimestamp,
  } = projectItem;

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
      <div className="projectName_container">
        <div className="img_container">
          {isLoading ? (
            <div className="loading_cover_image" />
          ) : (
            <img
              loading="lazy"
              src={imgSrc}
              id={`project_list_item_cover_image_${project_id}`}
              onError={(e) => {
                setIsLoading(false);
                setImgSrc(getRandomCoverImage());
                e.target.onerror = null;
              }}
              alt="_"
            />
          )}
        </div>
        <CustomToolTip title={project_name}>
          <p
            className={`projectName boldFamily ${projectType.replace(
              " ",
              "_"
            )}`}
            onClick={projectType === "My Projects" ? onProjectClick : () => {}}
          >
            {project_name}
          </p>
        </CustomToolTip>
        {projectType === "My Projects" && (
          <IconButtonWrapper
            icon="Edit"
            className="edit_icon_project_list"
            onClick={() => {
              openEditClick();
            }}
          />
        )}
      </div>
      <CustomToolTip title={assets || "-"}>
        <div className="projectattr">
          <p>{assets || "-"}</p>
        </div>
      </CustomToolTip>
      {projectType === "My Projects" && (
        <div className="projectattr">
          <p>{formatProjectDate(newtimestamp)}</p>
        </div>
      )}
      <div className="projectattr">
        <p>{formatProjectDate(changetimestamp)}</p>
      </div>
      {projectType !== "My Projects" && (
        <div className="projectattr">
          <p>{formatProjectDate(deletetimestamp)}</p>
        </div>
      )}
      <CustomToolTip title={description || "-"}>
        <div id="description">
          <p>{description || "-"}</p>
        </div>
      </CustomToolTip>

      {projectType === "My Projects" ? (
        <div onClick={onDeleteClick} className="projectDelete">
          <IconButtonWrapper icon="Trash" />
        </div>
      ) : (
        <div className="list_archive_btn_container">
          <ButtonWrapper size="s" variant="filled" onClick={onRestoreClicked}>
            Restore
          </ButtonWrapper>
        </div>
      )}
    </>
  );
}
