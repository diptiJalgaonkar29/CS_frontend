import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../../../common/components/layout/Layout";
import VideoLayout from "../../../../common/components/videoLayout/VideoLayout";
import NavStrings from "../../../../routes/constants/NavStrings";
import RecommendedAITracksPage from "../../components/RecommendedAITracksPage/RecommendedAITracksPage";
import VoiceTab from "../../components/VoiceTab/VoiceTab";
import "./WorkSpacePage.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import AIMusicTab from "../../components/AIMusicTab/AIMusicTab";
import updateVoiceMeta from "../../services/voiceDB/updateVoiceMeta";
import showNotification from "../../../../common/helperFunctions/showNotification";
import useDidMount from "../../../../customHooks/useDidMount";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import VideoLayoutForShell from "../../../../common/components/videoLayoutForShell/VideoLayoutForShell";
import { brandConstants } from "../../../../utils/brandConstants";
import VideoLayoutV2 from "../../../../common/components/VideoLayoutV2/VideoLayoutV2";
import AIMusicStabilityTab from "../../components/AIMusicTab/AIMusicStabilityTab";
import getCSUserMeta from "../../../../utils/getCSUserMeta";

const superBrandName = getSuperBrandName();

const WorkSpacePage = () => {
  const { authMeta } = useSelector((state) => state?.auth);
  const navigate = useNavigate();
  const { activeWSTab, projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const { cueID, aiMusicGenerator } = useSelector((state) => state.AIMusic);
  const { selectedVoices, TTSTimelineVoicesMP3 } = useSelector(
    (state) => state.voices
  );
  const { tXsplit } = useSelector((state) => state.video);
  let { project_id, cue_id } = useParams();

  let { state } = useLocation();

  console.log("cueID from param", cue_id);

  const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);

  const AUTO_SAVE_DEBOUNCE_TIME = 600;
  const didMount = useDidMount();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { brandMeta } = getCSUserMeta();

  const selectedVoicesMemo = useMemo(() => selectedVoices, [selectedVoices]);
  const TTSTimelineVoicesMP3Memo = useMemo(
    () => TTSTimelineVoicesMP3,
    [TTSTimelineVoicesMP3]
  );

  useEffect(() => {
    if (selectedVoices === null) return;
    let debounceId;
    console.log("didMount", didMount);
    if (didMount) {
      debounceId = setTimeout(() => {
        autoSaveVoiceData(selectedVoices, TTSTimelineVoicesMP3);
      }, AUTO_SAVE_DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceId);
    };
  }, [selectedVoicesMemo, TTSTimelineVoicesMP3Memo]);

  // console.log("aiMusicGenerator?.status", aiMusicGenerator?.status);

  // useEffect(() => {
  //   console.log(`selectedVoicesMemo :: `, selectedVoicesMemo);
  // }, [selectedVoicesMemo]);

  // useEffect(() => {
  //   console.log(`TTSTimelineVoicesMP3Memo :: `, TTSTimelineVoicesMP3Memo);
  // }, [TTSTimelineVoicesMP3Memo]);

  const autoSaveVoiceData = async (jsonStructure, TTSTimelineVoicesMP3) => {
    let voiceMeta = {
      projectId: projectID,
      jsonStructure,
      ttsTimelineStructure: TTSTimelineVoicesMP3,
    };
    console.log("Auto Saving.......");
    updateVoiceMeta({
      voiceMeta,
      onSuccess: () => {
        console.log("AUTO SAVED.......");
        // showNotification("SUCCESS", "Auto Saved!", 1500);
      },
    });
  };

  useLayoutEffect(() => {
    console.log("project_id param***", project_id);
    console.log("projectID ***", projectID);
    console.log("cueID ***", cueID);
    console.log("cue_id ***", cue_id);
    if (project_id) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    // if (!!project_id && !projectID) {
    //   console.log("nav to ", `${NavStrings.WORKSPACE}/project/${project_id}`);
    // navigate(`${NavStrings.WORKSPACE}/project/${project_id}`, {
    //   replace: true,
    // });
    //   return;
    // }
    console.log("currentUseThisTrack", currentUseThisTrack)
    const newPath = brandMeta?.aiMusicProvider == "stability" ?
      getWorkSpacePath(projectID, cue_id || currentUseThisTrack) :
      getWorkSpacePath(projectID, cueID);
    console.log("location.pathname", location.pathname);
    console.log("newPath", newPath);
    if (location.pathname !== newPath) {
      console.log("called from inside")
      if (brandMeta?.aiMusicProvider === "stability") {
        console.log("called_1")
        window.history.pushState({}, "", newPath);
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else {
        console.log("called_2")
        navigate(newPath, {
          replace: true,
        });
      }
    } else {
      console.log("same route", location.pathname);
    }
  }, [projectID, cueID, project_id, currentUseThisTrack]);

  if (!projectID) {
    return (
      <Layout>
        <div className="WS_no_data_wrapper">
          <div className="header_container">
            <p className="sub_header highlight_text">
              Please create or select existing project
            </p>
            <ButtonWrapper
              style={{ marginTop: "10px" }}
              onClick={() => {
                navigate(NavStrings.HOME);
              }}
            >
              Go to Home
            </ButtonWrapper>
          </div>
        </div>
      </Layout>
    );
  }

  console.log("state", state);

  function isValidURL(url) {
    try {
      new URL(url); // will throw if invalid
      return true;
    } catch (_) {
      return false;
    }
  }

  return (
    <Layout>
      <VideoLayoutV2>
        {activeWSTab === "Voice" ? (
          <>
            {tXsplit === "0" ? (
              <div className="voice_music_placeholder voice_placeholder_block">
                <p>
                  As Voice from Video is retained, you can't create an AI Voice
                </p>
              </div>
            ) : (
              <VoiceTab />
            )}
          </>
        ) : (
          <>
            {tXsplit === "1" ? (
              <div className="voice_music_placeholder music_placeholder_block">
                <p>
                  As Music from Video is retained, you can't create an AI Music
                </p>
              </div>
            ) : (
              <>
                {isLoading ? (
                  <div className="AIMusicTab_loader_container">
                    <CustomLoaderSpinner />
                  </div>
                ) : (
                  <>
                    {(brandMeta?.aiMusicProvider == "stability" && !!cue_id) ? (
                      <AIMusicStabilityTab cueID={cue_id} />
                    ) : !!cue_id ? (
                      <AIMusicTab cueID={cue_id} />
                    ) : (
                      <RecommendedAITracksPage />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </VideoLayoutV2>
    </Layout>
  );
};

export default WorkSpacePage;
