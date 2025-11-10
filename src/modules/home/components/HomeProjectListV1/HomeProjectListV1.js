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
import "./HomeProjectListV1.css";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import getProjects from "../../../projects/services/getProjects";
import { useConfig } from "../../../../customHooks/useConfig";
import NavStrings from "../../../../routes/constants/NavStrings";
import EditProjectInfoModal from "../../../projects/components/EditProjectInfoModal/EditProjectInfoModal";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import ProjectGridItemV1 from "../../../projects/components/ProjectGridItemV1/ProjectGridItemV1";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";

const HomeProjectListV1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useConfig();
  const [projectDataArr, setProjectDataArr] = useState([]);
  const { projectID } = useSelector((state) => state.projectMeta);
  const [deleteProjectModal, setDeleteProjectModal] = useState({});
  const [editProjectInfo, setEditProjectInfo] = useState({});
  const [loading, setLoading] = useState(true)

  const getProjectsByUserID = async () => {
    getProjects({
      limit: 5,
      onSuccess: (response) => {
        setProjectDataArr(response?.data || []);
        setLoading(false);
      },
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
    <>
      {
        loading ? (
          <div className="custom_loader_V1">
            <CustomLoaderSpinner /> 
          </div>
        ) : (
          projectDataArr?.length !== 0 && (
            <div className="existing-projectsV1">
              {projectDataArr.map((project, index) => (
                <LazyLoadComponent
                  className="project_grid_itemV1"
                  ref={React.createRef()}
                  key={`existing-projects-${index}`}
                >
                  <ProjectGridItemV1
                    index={index}
                    projectItem={project}
                    onProjectClick={() =>
                      navigate(`${NavStrings.WORKSPACE}/project/${project?.project_id}`)
                    }
                    onDeleteClick={() => openDeleteProjectModal(project)}
                    openEditClick={() => openEditProjectModal(project)}
                  />
                </LazyLoadComponent>
              ))}
              <div className="card" onClick={() => navigate(NavStrings.PROJECTS)}>
                <div className="content_seemore">
                  <div className="SeeMore_option">See More Projects</div>
                </div>
              </div>
            </div>
          )
        )
      }

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
    </>
  );
};

export default HomeProjectListV1;
