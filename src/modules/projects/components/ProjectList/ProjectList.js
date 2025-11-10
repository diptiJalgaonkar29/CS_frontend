import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RESET_AI_MUSIC_META } from "../../../workSpace/redux/AIMusicSlice";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../../workSpace/redux/projectMetaSlice";
import { RESET_VIDEO_META } from "../../../workSpace/redux/videoSlice";
import { RESET_VOICE_META } from "../../../workSpace/redux/voicesSlice";
import restoreProject from "../../services/restoreProject";
import deleteProject from "../../services/deleteProject";
import DeleteProjectModal from "../DeleteProjectModal/DeleteProjectModal";
import ProjectGridItem from "../ProjectGridItem/ProjectGridItem";
import ProjectListItem from "../ProjectListItem/ProjectListItem";
import ProjectTableHeader from "../ProjectTableHeader/ProjectTableHeader";
import "./ProjectList.css";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import EditProjectInfoModal from "../EditProjectInfoModal/EditProjectInfoModal";
import sortByKey from "../../../../utils/sortByKey";
import { useConfig } from "../../../../customHooks/useConfig";
import NavStrings from "../../../../routes/constants/NavStrings";

const ProjectList = ({
  selectedProjectType,
  viewType,
  searchQuery,
  setSearchQuery,
  filteredProjectDataArr,
  setFilteredProjectDataArr,
  projectDataArr,
  setProjectDataArr,
  myProjectData,
  setMyProjectData,
  archiveProjectData,
  setArchiveProjectData,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectID } = useSelector((state) => state.projectMeta);
  const [editProjectInfo, setEditProjectInfo] = useState({});
  const [deleteProjectModal, setDeleteProjectModal] = useState({});

  const onRestoreProjectSuccess = (selectedProjectID) => {
    let newArchiveProjectData = projectDataArr?.filter(
      (data) => data.project_id !== selectedProjectID
    );
    let removedArchiveProjectData = projectDataArr?.find(
      (data) => data.project_id === selectedProjectID
    );
    let newMyProjectData = [...myProjectData, removedArchiveProjectData];
    setArchiveProjectData(newArchiveProjectData);
    setFilteredProjectDataArr(newArchiveProjectData);
    setProjectDataArr(newArchiveProjectData);
    setMyProjectData(newMyProjectData);
  };

  const onRestoreClicked = (projectName, selectedProjectID) => {
    if (searchQuery) {
      setSearchQuery("");
    }
    restoreProject({
      projectID: selectedProjectID,
      projectName,
      onSuccess: () => onRestoreProjectSuccess(selectedProjectID),
    });
  };

  const onDeleteSuccess = (selectedProjectID) => {
    let newProjectData = projectDataArr?.filter(
      (data) => data.project_id !== selectedProjectID
    );
    let removedProjectData = projectDataArr.find(
      (data) => data.project_id === selectedProjectID
    );
    let newArchiveData = [
      ...archiveProjectData,
      { ...removedProjectData, deletetimestamp: Date.now() },
    ];
    setMyProjectData(newProjectData);
    setArchiveProjectData(newArchiveData);
    setFilteredProjectDataArr(newProjectData);
    setProjectDataArr(newProjectData);
    if (+projectID === +selectedProjectID) {
      // console.log("resetting redux data");
      dispatch(RESET_VIDEO_META());
      dispatch(RESET_VOICE_META());
      dispatch(RESET_AI_MUSIC_META());
      dispatch(RESET_PROJECT_META());
    }
    closeDeleteProjectModal();
  };

  const onEditSuccess = (selectedProjectID, projectMeta) => {
    let newProjectData = projectDataArr?.map((data) => {
      if (data?.project_id == selectedProjectID) {
        return {
          ...data,
          project_name: projectMeta?.projectName,
          description: projectMeta?.description,
          changetimestamp: Date.now(),
        };
      }
      return data;
    });
    let sortedByLastUpdate = sortByKey(
      newProjectData,
      "changetimestamp",
      "DESC"
    );
    sortingMeta.current = {
      sortedBy: "changetimestamp",
      isAscendingOrder: false,
    };
    setMyProjectData(sortedByLastUpdate);
    setFilteredProjectDataArr(sortedByLastUpdate);
    setProjectDataArr(sortedByLastUpdate);
    setEditProjectInfo({
      isOpen: false,
      projectName: "",
      projectID: null,
    });
  };

  const onDeleteClicked = (projectName, selectedProjectID) => {
    // console.log("project ID to delete : ", selectedProjectID);
    if (searchQuery) {
      setSearchQuery("");
    }
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

  const closeDeleteProjectModal = () => {
    setDeleteProjectModal({
      isOpen: false,
      projectName: "",
      projectID: null,
    });
  };

  const sortingMeta = useRef({
    sortedBy: "changeTimestamp",
    isAscendingOrder: false,
  });

  if (filteredProjectDataArr?.length === 0) {
    return (
      <p className="no_filtered_data_text boldFamily">No projects found</p>
    );
  }

  return (
    <>
      <div className="page_content">
        {filteredProjectDataArr?.length !== 0 && viewType === "List" && (
          <ProjectTableHeader
            selectedProjectType={selectedProjectType}
            filteredProjectDataArr={filteredProjectDataArr}
            setFilteredProjectDataArr={setFilteredProjectDataArr}
            sortingMeta={sortingMeta}
          />
        )}
        <div
          className={`${
            viewType === "List" ? "page_project_field " : "page_project_grid"
          } ${selectedProjectType.replace(" ", "_")}`}
        >
          {filteredProjectDataArr?.map((project, i) => (
            <React.Fragment key={`${project?.project_name}-${i}`}>
              {viewType === "List" ? (
                <LazyLoadComponent
                  ref={React.createRef()}
                  defaultHeight={66}
                  className="project_list_item"
                >
                  <ProjectListItem
                    projectItem={project}
                    projectType={selectedProjectType}
                    onProjectClick={() => {
                      // console.log("cliked project", project?.project_id);
                      navigate(
                        `${NavStrings.WORKSPACE}/project/${project?.project_id}`
                      );
                    }}
                    onDeleteClick={() => openDeleteProjectModal(project)}
                    onRestoreClicked={() =>
                      onRestoreClicked(
                        project?.project_name,
                        project?.project_id
                      )
                    }
                    openEditClick={() => openEditProjectModal(project)}
                  />
                </LazyLoadComponent>
              ) : (
                <LazyLoadComponent
                  className="project_grid_item"
                  ref={React.createRef()}
                  defaultHeight={194}
                >
                  <ProjectGridItem
                    projectItem={project}
                    projectType={selectedProjectType}
                    onProjectClick={() => {
                      // console.log("cliked project", project?.project_id);
                      navigate(
                        `${NavStrings.WORKSPACE}/project/${project?.project_id}`
                      );
                    }}
                    onDeleteClick={() => openDeleteProjectModal(project)}
                    onRestoreClicked={() =>
                      onRestoreClicked(
                        project?.project_name,
                        project?.project_id
                      )
                    }
                    openEditClick={() => openEditProjectModal(project)}
                  />
                </LazyLoadComponent>
              )}
            </React.Fragment>
          ))}
        </div>
        <DeleteProjectModal
          isOpen={deleteProjectModal?.isOpen}
          projectName={deleteProjectModal?.projectName}
          onClose={closeDeleteProjectModal}
          onDelete={() =>
            onDeleteClicked(
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
          onEditSuccess={onEditSuccess}
        />
      </div>
    </>
  );
};

export default ProjectList;
