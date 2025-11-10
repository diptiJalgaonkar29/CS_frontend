import React, { useEffect } from "react";
import "./WorkSpaceProjectPage.css";
import { useNavigate, useParams } from "react-router-dom";
import loadProjectById from "../../../projects/helperFunctions/loadProjectById";
import { useDispatch, useSelector } from "react-redux";
import NavStrings from "../../../../routes/constants/NavStrings";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { SET_AI_Track_Stability_META } from "../../redux/AITrackStabilitySlice";

const WorkSpaceProjectPage = () => {
  let { project_id } = useParams();
  let dispatch = useDispatch()
  const { projectID } = useSelector((state) => state.projectMeta);
  const { cueID } = useSelector((state) => state.AIMusic);
  const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);
  const navigate = useNavigate();
  const { brandMeta } = getCSUserMeta();
  const getCurrentUseThisTrack = localStorage.getItem("currentUseThisTrack") || ""
  const splitAndGetID = getCurrentUseThisTrack?.split("-")

  useEffect(() => {
    try {
      if (!project_id) return;
      // console.log("project_id***", project_id);
      // console.log("projectID***", projectID);
      // console.log("Fetching project by ID", project_id);
      if (+project_id !== +projectID) {
        loadProjectById(project_id, navigate);
      } else if (!!getCurrentUseThisTrack) {
        console.log("splitAndGetID", splitAndGetID);
        if (+project_id == splitAndGetID?.[0]) {
          dispatch(
            SET_AI_Track_Stability_META({ currentUseThisTrack: splitAndGetID?.[1] })
          )
          navigate(getWorkSpacePath(projectID, splitAndGetID?.[1]), {
            replace: true,
          });
        } else {
          console.log("navigating to currentUseThisTrack")
          navigate(getWorkSpacePath(projectID, null), {
            replace: true,
          });
        }
      } else if (!!currentUseThisTrack && brandMeta?.aiMusicProvider === 'Stability') {
        navigate(getWorkSpacePath(projectID, currentUseThisTrack), {
          replace: true,
        });
      } else {
        navigate(getWorkSpacePath(projectID, cueID), {
          replace: true,
        });
      }
    } catch (error) {
      console.log("error", error);
      navigate(NavStrings.PROJECTS, {
        replace: true,
      });
    }
  }, [project_id]);

  return <CustomLoader />;
};

export default WorkSpaceProjectPage;
