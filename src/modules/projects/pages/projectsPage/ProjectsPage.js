import React, { useEffect, useState } from "react";
import Layout from "../../../../common/components/layout/Layout";
import "./ProjectsPage.css";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import getGroupByData from "../../../../utils/getGroupByData";
import ProjectList from "../../components/ProjectList/ProjectList";
import ProjectPageHeader from "../../components/ProjectPageHeader/ProjectPageHeader";
import getProjects from "../../services/getProjects";

const ProjectsPage = () => {
  const [projectDataArr, setProjectDataArr] = useState(null);
  const [filteredProjectDataArr, setFilteredProjectDataArr] = useState(null);
  const [myProjectData, setMyProjectData] = useState(null);
  const [archiveProjectData, setArchiveProjectData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("List");
  const [selectedProjectType, setSelectedProjectType] = useState("My Projects");

  useEffect(() => {
    getFilteredProjectsBySearchQuery(projectDataArr, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedProjectType) {
      getProjectsData(selectedProjectType);
    }
  }, [selectedProjectType]);

  const getFilteredProjectsBySearchQuery = (projectData, searchQuery) => {
    let filteredArray = projectData?.filter((data) =>
      data?.project_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
    setFilteredProjectDataArr(filteredArray);
  };

  const onGetProjectsSuccess = (res, type) => {
    let filteredResponseData = res?.data;
    let filteredDataByStatus = getGroupByData(filteredResponseData, "status");
    let filteredArchiveResponseData = filteredDataByStatus["1"];
    setArchiveProjectData(filteredArchiveResponseData || []);
    let filteredMyProjectResponseData = filteredDataByStatus["0"];
    setMyProjectData(filteredMyProjectResponseData || []);
    if (type === "Archive") {
      filteredResponseData = filteredArchiveResponseData;
    } else {
      filteredResponseData = filteredMyProjectResponseData;
    }
    setProjectDataArr(filteredResponseData || []);
    setFilteredProjectDataArr(filteredResponseData || []);
  };

  const getProjectsData = async (type) => {
    if (type === "Archive" && Array.isArray(archiveProjectData)) {
      setProjectDataArr(archiveProjectData);
      if (searchQuery) {
        getFilteredProjectsBySearchQuery(archiveProjectData, searchQuery);
        return;
      }
      setFilteredProjectDataArr(archiveProjectData);
      return;
    }
    if (type === "My Projects" && Array.isArray(myProjectData)) {
      setProjectDataArr(myProjectData);
      if (searchQuery) {
        getFilteredProjectsBySearchQuery(myProjectData, searchQuery);
        return;
      }
      setFilteredProjectDataArr(myProjectData);
      return;
    }
    fetchNewProjects(type);
  };

  const fetchNewProjects = (type) => {
    getProjects({
      onSuccess: (response) => onGetProjectsSuccess(response, type),
      onError: () => {},
    });
  };

  if (projectDataArr == null) {
    return <CustomLoader />;
  }

  return (
    <Layout hideNavLinks={false}>
      <div className="projects_container">
        <ProjectPageHeader
          selectedProjectType={selectedProjectType}
          setSelectedProjectType={setSelectedProjectType}
          setViewType={setViewType}
          viewType={viewType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <ProjectList
          selectedProjectType={selectedProjectType}
          viewType={viewType}
          filteredProjectDataArr={filteredProjectDataArr}
          setProjectDataArr={setProjectDataArr}
          projectDataArr={projectDataArr}
          setFilteredProjectDataArr={setFilteredProjectDataArr}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          archiveProjectData={archiveProjectData}
          setArchiveProjectData={setArchiveProjectData}
          myProjectData={myProjectData}
          setMyProjectData={setMyProjectData}
        />
      </div>
    </Layout>
  );
};

export default ProjectsPage;
