import React from "react";
import Layout from "../../../../common/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import NavStrings from "../../../../routes/constants/NavStrings";
import "./HomePage.css";
import RecentProjectList from "../../components/RecentProjectList/RecentProjectList";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Layout hideNavLinks={false}>
        <div className="homePage_container">
          <div className="header_container">
            <p className="sub_header">Welcome to</p>
            <h1 className="header">CREATION STATION</h1>
          </div>
          <div
            className="new-project"
            onClick={() => {
              navigate(NavStrings.CS_OPTIONS);
            }}
          >
            <p>+ Create New Project</p>
          </div>
        </div>
        <RecentProjectList />
      </Layout>
    </>
  );
};

export default HomePage;
