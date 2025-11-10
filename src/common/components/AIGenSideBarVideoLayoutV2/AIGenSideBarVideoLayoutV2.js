import { useEffect, useState } from "react";
import { SideBarMusicStyleSelector } from "../../../modules/workSpace/components/SideBarMusicStyleSelector/SideBarMusicStyleSelector";
import MusicGenerationForm from "../../../modules/workSpace/components/AIMusicGenerationForm/MusicGenerationForm";
import { getAIAnalysisStatus } from "../../../modules/workSpace/helperFunctions/getAIAnalysisStatus";
import { useSelector } from "react-redux";
import { useConfig } from "../../../customHooks/useConfig";
import { useNavigate } from "react-router-dom";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import StabilityMusicGenerationForm from "../../../modules/workSpace/components/AIMusicGenerationForm/StabilityAIMusicGenerationForm/StabilityMusicGenerationForm";

const AIGenSideBarVideoLayoutV2 = ({ children }) => {
  const { config, jsonConfig } = useConfig();
  const navigate = useNavigate();
  const [selectedAIGenTab, setSelectedAIGenTab] = useState("SIMPLE");
  const {
    aiMusicGeneratorProgress,
  } = useSelector((state) => state.AIMusic);
  const { brandMeta } = getCSUserMeta();

  const stopPolling = (interval) => {
    clearInterval(interval);
    // dispatch(RESET_LOADING_STATUS());
  };

  useEffect(() => {
    if (!aiMusicGeneratorProgress?.id) return;
    getAIAnalysisStatus({
      analysisId: aiMusicGeneratorProgress?.id,
      navigate,
      stopPollingRequest: () => {
        stopPolling(interval);
      },
      config,
      jsonConfig,
    });
    const interval = setInterval(() => {
      getAIAnalysisStatus({
        analysisId: aiMusicGeneratorProgress?.id,
        navigate,
        stopPollingRequest: () => {
          stopPolling(interval);
        },
        config,
        jsonConfig,
      });
    }, 10000); // Retry every 5 seconds

    return () => stopPolling(interval); // Cleanup on unmount
  }, [aiMusicGeneratorProgress?.id]);

  return (
    <div className="card ai_generator_option">
      <div className="tab_header" style={{
        pointerEvents: aiMusicGeneratorProgress?.id ? "none" : undefined
      }}>
        {brandMeta?.aiMusicProvider == "stability" ?
          (<span
            className={`tab ${selectedAIGenTab === "SIMPLE" ? "activeTab" : ""}`}
            onClick={() => setSelectedAIGenTab("SIMPLE")}
          >
            Simple
          </span>)
          :
          <>
            <span
              className={`tab ${selectedAIGenTab === "SIMPLE" ? "activeTab" : ""}`}
              onClick={() => setSelectedAIGenTab("SIMPLE")}
            >
              Simple
            </span>
            <span
              className={`tab ${selectedAIGenTab === "ADVANCED" ? "activeTab" : ""
                }`}
              onClick={() => setSelectedAIGenTab("ADVANCED")}
            >
              Advanced
            </span>
          </>
        }
      </div>
      {children}
      {selectedAIGenTab === "SIMPLE" ? (
        <>
          {brandMeta?.aiMusicProvider == "stability" ? <StabilityMusicGenerationForm /> : <MusicGenerationForm />}
        </>
      ) : (
        <>
          <h2 className="title">Compose with AI</h2>
          <p className="subTitle">
            Select the genre, mood, and tempo you want to craft the ideal music
            for your project.
          </p>
          <SideBarMusicStyleSelector />
        </>
      )}
    </div>
  );
};

export default AIGenSideBarVideoLayoutV2;
