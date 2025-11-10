import React, { useRef, useState } from "react";
import { ReactComponent as Left } from "../../../../static/common/leftArrow.svg";
import { ReactComponent as Right } from "../../../../static/common/rightArrow.svg";
import "./CustomCarousel.css";
import DeleteProjectModal from "../../../projects/components/DeleteProjectModal/DeleteProjectModal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../../workSpace/redux/projectMetaSlice";
import deleteProject from "../../../projects/services/deleteProject";
import ProjectGridItem from "../../../projects/components/ProjectGridItem/ProjectGridItem";
import { RESET_VIDEO_META } from "../../../workSpace/redux/videoSlice";
import { RESET_VOICE_META } from "../../../workSpace/redux/voicesSlice";
import { RESET_AI_MUSIC_META } from "../../../workSpace/redux/AIMusicSlice";
import EditProjectInfoModal from "../../../projects/components/EditProjectInfoModal/EditProjectInfoModal";
import { useConfig } from "../../../../customHooks/useConfig";
import NavStrings from "../../../../routes/constants/NavStrings";

export default function CustomCarousel({ items, getProjectList }) {
  const leftArrowRef = useRef(null);
  const rightArrowRef = useRef(null);
  const recentProjectListContainerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projectID } = useSelector((state) => state.projectMeta);
  const [editProjectInfo, setEditProjectInfo] = useState({});
  const [deleteProjectModal, setDeleteProjectModal] = useState({});
  const { config } = useConfig();

  const SCROLL_PX_BY = 750;

  function scrollProjectList(direction) {
    let left;
    var container = recentProjectListContainerRef.current;
    if (direction === "LEFT") {
      left = container.scrollLeft - SCROLL_PX_BY;
    } else {
      left = container.scrollLeft + SCROLL_PX_BY;
    }
    container.scroll({
      left,
      behavior: "smooth",
    });
  }

  function setArrowVisibility(ref, action) {
    if (action === "HIDE") {
      ref.current.style.opacity = 0;
      ref.current.style.cursor = "default";
    } else {
      ref.current.style.opacity = 1;
      ref.current.style.cursor = "pointer";
    }
  }

  function onScrollProjectList(event) {
    if (event.target.scrollLeft === 0) {
      setArrowVisibility(leftArrowRef, "HIDE");
    } else {
      setArrowVisibility(leftArrowRef, "SHOW");
    }
    if (
      event.target.scrollLeft + event.target.offsetWidth ===
      event.target.scrollWidth
    ) {
      setArrowVisibility(rightArrowRef, "HIDE");
    } else {
      setArrowVisibility(rightArrowRef, "SHOW");
    }
  }

  const onDeleteSuccess = (selectedProjectID) => {
    getProjectList();
    if (+projectID === +selectedProjectID) {
      dispatch(RESET_VIDEO_META());
      dispatch(RESET_VOICE_META());
      dispatch(RESET_AI_MUSIC_META());
      dispatch(RESET_PROJECT_META());
    }
    setDeleteProjectModal({
      isOpen: false,
      projectName: "",
      projectID: null,
    });
  };

  const onDeleteProject = (projectName, selectedProjectID) => {
    // console.log("project ID to delete : ", selectedProjectID);
    deleteProject({
      projectID: selectedProjectID,
      projectName,
      onSuccess: () => onDeleteSuccess(selectedProjectID),
    });
  };

  const openDeleteProjectModal = (project) => {
    setDeleteProjectModal({
      isOpen: true,
      projectName: project?.project_name,
      projectID: project?.project_id,
    });
  };

  const openEditProjectModal = (project) => {
    setEditProjectInfo({
      isOpen: true,
      projectName: project?.project_name,
      projectID: project?.project_id,
      projectDescription: project?.description,
      project_logo: "",
    });
  };

  if (items?.length === 0) {
    return;
  }

  return (
    <>
      <div className="custom_carousel_container">
        <Left
          ref={leftArrowRef}
          className="arrow"
          style={{ opacity: 0, cursor: "default" }}
          onClick={() => {
            scrollProjectList("LEFT");
          }}
        />
        <div
          className="carousel_list"
          onScroll={onScrollProjectList}
          ref={recentProjectListContainerRef}
        >
          {items?.map((item, index) => (
            <LazyLoadComponent
              className="project_grid_item card_container"
              ref={React.createRef()}
              defaultHeight={194}
              key={`existing-projects-${index}`}
            >
              <ProjectGridItem
                index={index}
                projectItem={item}
                onProjectClick={() =>
                  navigate(
                    `${NavStrings.WORKSPACE}/project/${item?.project_id}`
                  )
                }
                onDeleteClick={() => openDeleteProjectModal(item)}
                openEditClick={() => openEditProjectModal(item)}
              />
            </LazyLoadComponent>
          ))}
        </div>
        <Right
          ref={rightArrowRef}
          className="arrow"
          onClick={() => {
            scrollProjectList("RIGHT");
          }}
        />
      </div>
      <DeleteProjectModal
        isOpen={deleteProjectModal?.isOpen}
        onClose={() =>
          setDeleteProjectModal({
            isOpen: false,
            projectName: "",
            projectID: null,
          })
        }
        projectName={deleteProjectModal?.projectName}
        onDelete={() =>
          onDeleteProject(
            deleteProjectModal?.projectName,
            deleteProjectModal?.projectID
          )
        }
      />

      <EditProjectInfoModal
        isOpen={editProjectInfo?.isOpen}
        onClose={() =>
          setEditProjectInfo({ ...editProjectInfo, isOpen: false })
        }
        setEditProjectInfo={setEditProjectInfo}
        editProjectInfo={editProjectInfo}
        onEditSuccess={getProjectList}
      />
    </>
  );
}
