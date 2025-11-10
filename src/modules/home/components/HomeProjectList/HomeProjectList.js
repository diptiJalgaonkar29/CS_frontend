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
import "./HomeProjectList.css";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import getProjects from "../../../projects/services/getProjects";
import { useConfig } from "../../../../customHooks/useConfig";
import NavStrings from "../../../../routes/constants/NavStrings";
import EditProjectInfoModal from "../../../projects/components/EditProjectInfoModal/EditProjectInfoModal";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const HomeProjectList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useConfig();
  const [projectDataArr, setProjectDataArr] = useState([]);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [deleteProjectModal, setDeleteProjectModal] = useState({});
  const [editProjectInfo, setEditProjectInfo] = useState({});

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

  const openEditProjectModal = (project) => {
    setEditProjectInfo({
      isOpen: true,
      projectName: project?.project_name,
      projectID: project?.project_id,
      projectDescription: project?.description,
      project_logo: "",
    });
  };

  if (projectDataArr?.length === 0) return <></>;

  return (
    <div>
      <p className="section_header">
        <IconWrapper icon="Folder" /> Recent Projects
      </p>
      <div className="projectList_Container">
        <div className="home_projectsList_container">
          {projectDataArr?.length !== 0 && (
            <>
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
                          `${NavStrings.WORKSPACE}/project/${project?.project_id}`
                        )
                      }
                      onDeleteClick={() => openDeleteProjectModal(project)}
                      openEditClick={() => openEditProjectModal(project)}
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

          <EditProjectInfoModal
            isOpen={editProjectInfo?.isOpen}
            onClose={() =>
              setEditProjectInfo({ ...editProjectInfo, isOpen: false })
            }
            setEditProjectInfo={setEditProjectInfo}
            editProjectInfo={editProjectInfo}
            onEditSuccess={getProjectsByUserID}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeProjectList;
