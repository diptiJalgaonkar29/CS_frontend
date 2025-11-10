import React, { useEffect, useState } from "react";
import DeleteProjectModal from "../../../projects/components/DeleteProjectModal/DeleteProjectModal";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../../workSpace/redux/projectMetaSlice";
import { RESET_VOICE_META } from "../../../workSpace/redux/voicesSlice";
import { RESET_VIDEO_META } from "../../../workSpace/redux/videoSlice";
import { RESET_AI_MUSIC_META } from "../../../workSpace/redux/AIMusicSlice";
import ProjectGridItem from "../../../projects/components/ProjectGridItem/ProjectGridItem";
import deleteProject from "../../../projects/services/deleteProject";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./RecentProjectList.css";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import getProjects from "../../../projects/services/getProjects";
import { useConfig } from "../../../../customHooks/useConfig";
import NavStrings from "../../../../routes/constants/NavStrings";

const RecentProjectList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useConfig();
  const [projectDataArr, setProjectDataArr] = useState([]);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [deleteProjectModal, setDeleteProjectModal] = useState({});

  const getProjectsByUserID = async () => {
    getProjects({
      limit: 5,
      onSuccess: (response) => setProjectDataArr(response?.data || []),
    });
  };

  useEffect(() => {
    getProjectsByUserID();
  }, []);

  const onDeleteSuccess = (selectedProjectID) => {
    getProjectsByUserID();
    if (+projectID === +selectedProjectID) {
      // console.log("resetting redux data");
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

  const closeDeleteProjectModal = () => {
    setDeleteProjectModal({
      isOpen: false,
      projectName: "",
      projectID: null,
    });
  };

  return (
    <div className="recent_projects_container">
      {projectDataArr?.length !== 0 && (
        <>
          <h2 className="existing-project__header">Most Recent Projects</h2>
          <div className="existing-projects">
            {projectDataArr?.map((project, index) => (
              <LazyLoadComponent
                className="project_grid_item"
                ref={React.createRef()}
                defaultHeight={194}
                key={`existing-projects-${index}`}
              >
                <ProjectGridItem
                  index={index}
                  projectItem={project}
                  onProjectClick={() =>
                    navigate(
                      `${NavStrings.WORKSPACE}/project/${item?.project_id}`
                    )
                  }
                  onDeleteClick={() => openDeleteProjectModal(project)}
                />
              </LazyLoadComponent>
            ))}
          </div>
        </>
      )}
      <DeleteProjectModal
        isOpen={deleteProjectModal?.isOpen}
        projectName={deleteProjectModal?.projectName}
        onClose={closeDeleteProjectModal}
        onDelete={() =>
          onDeleteProject(
            deleteProjectModal?.projectName,
            deleteProjectModal?.projectID
          )
        }
      />
    </div>
  );
};

export default RecentProjectList;
