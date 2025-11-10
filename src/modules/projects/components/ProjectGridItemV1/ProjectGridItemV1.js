import React, { useEffect, useState } from "react";
import "./ProjectGridItemV1.css";
import coverImgDefault1 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault1.svg";
import coverImgDefault2 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault2.svg";
import coverImgDefault3 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault3.svg";
import coverImgDefault4 from "../../../../static/projects_Page/ProjectIcons/coverImgDefault4.svg";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { ReactComponent as AiMusic } from '../../../../static/common/AIMUSIC.svg'
import { ReactComponent as AiVoice } from '../../../../static/common/AIVOICE.svg'
import { ReactComponent as AiVideo } from '../../../../static/common/ProjectAssets.svg'

export default function ProjectGridItemV1({
  projectItem,
  projectType = "My Projects",
  onProjectClick = () => { },
  onDeleteClick = () => { },
  onRestoreClicked = () => { },
  openEditClick = () => { },
}) {
  const { project_id, project_name, assets, cover_image } = projectItem;

  const [isLoading, setIsLoading] = useState(!!cover_image);
  const [imgSrc, setImgSrc] = useState(null);
  let assestValidator = (assets || "").split("+")?.map((e) => e?.trim())

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
    <div className="project_grid_v1">
      <div className="card">
        <div className="header">
          <div className="icons-left">
            <div style={{
              opacity: assestValidator.includes("Video") ? 1 : 0.5
            }}>
              <AiVideo />
            </div>
            <div style={{
              opacity: assestValidator.includes("AI Voice") ? 1 : 0.5
            }}>
              <AiVoice />
            </div>
            <div
              style={{
                opacity: assestValidator.includes("AI Music") ? 1 : 0.5
              }}
            >
              <AiMusic />
            </div>
          </div>
          <div onClick={onDeleteClick} className="trashBtn">
            <IconWrapper icon="Trash" />
          </div>
        </div>

        <div className="content" onClick={onProjectClick}>
          <div className="title">{project_name}</div>
          <div className="subtitle">Last opened 1 day ago</div>
        </div>
      </div>
    </div>
  );
}
