import React, { useEffect, useState } from "react";
import "./RecentProjectsCarousel.css";
import getProjects from "../../../projects/services/getProjects";
import CustomCarousel from "../customCarousel/CustomCarousel";

export default function RecentProjectsCarousel() {
  const [recentProjectsArray, setRecentProjectsArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let getProjectList = () => {
    getProjects({
      limit: 10,
      onSuccess: (response) => {
        setRecentProjectsArray(response.data);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  useEffect(() => {
    getProjectList();
  }, []);

  if (isLoading || recentProjectsArray?.length === 0) {
    return;
  }

  return (
    <div className="recent_project_container">
      <p className="header">Most Recent Projects</p>
      <CustomCarousel
        items={recentProjectsArray}
        getProjectList={getProjectList}
      />
    </div>
  );
}
