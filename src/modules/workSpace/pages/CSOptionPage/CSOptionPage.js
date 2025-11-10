import React, { useEffect, useState } from "react";
import { ReactComponent as Music } from "../../../../static/AI_music/AI_music.svg";
import { ReactComponent as Voice } from "../../../../static/common/voice.svg";
import "./CSOptionPage.css";
import Layout from "../../../../common/components/layout/Layout";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SET_PROJECT_META } from "../../../workSpace/redux/projectMetaSlice";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import {
  checkAIMusicCreateAccess,
  checkAIVoiceAccess,
} from "../../../../utils/checkAppAccess";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import { SET_AI_MUSIC_Stability_META } from "../../../workSpace/redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../../workSpace/redux/AITrackStabilitySlice";

const CSOptionPage = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedCSOption, setSelectedCSOption] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  var crationStationOptions = [
    {
      label: "AI Music",
      isEnabled: checkAIMusicCreateAccess(),
      icon: (
        <Music
          fill={
            selectedCSOption === "AI Music"
              ? "var(--color-primary)"
              : "var(--color-white)"
          }
        />
      ),
    },
    {
      label: "Voice",
      isEnabled: checkAIVoiceAccess(),
      icon: (
        <Voice
          fill={
            selectedCSOption === "Voice"
              ? "var(--color-primary)"
              : "var(--color-white)"
          }
        />
      ),
    },
  ];

  useEffect(() => {
    console.log("crationStationOptions", crationStationOptions);
    if (crationStationOptions?.length === 0) return;
    let enabledCrationStationOptions = crationStationOptions?.filter(
      (option) => option?.isEnabled
    );
    console.log("enabledCrationStationOptions", enabledCrationStationOptions);
    if (enabledCrationStationOptions?.length === 1) {
      dispatch(
        SET_PROJECT_META({
          activeWSTab: enabledCrationStationOptions?.[0]?.label,
        })
      );
      navigate(NavStrings.PROJECT_SETTINGS, { replace: true });
      return;
    }
    setIsLoading(false);
  }, [crationStationOptions?.length]);

  return (
    <Layout fullWidth={true}>
      <div className="creationStation_homePage_wrapper">
        {isLoading ? (
          <div className="creationStation_homePage_loader_container">
            <CustomLoaderSpinner />
          </div>
        ) : (
          <div className="creationStation_homePage_container">
            <div className="creationStation_homePage_header">
              <p
                // style={{ fontSize: "16px", padding: "0px 25px" }}
                className="boldFamily"
              >
                How would you like to start the project?
              </p>
            </div>
            <div className="creationStation_homePage_option_container">
              {crationStationOptions.map((option) => (
                <React.Fragment key={"CS_homePage_option" + option.label}>
                  <div
                    className={`creationStation_homePage_option ${
                      option.label === selectedCSOption ? "selected" : ""
                    } ${option.isEnabled ? "" : "disabled"}`}
                    onClick={() => {
                      if (!option.isEnabled) return;
                      setSelectedCSOption(option.label);
                    }}
                  >
                    {option.icon}
                    <div className="creationStation_homePage_option_title">
                      {option.label}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="btns_container">
              <ButtonWrapper
                variant="outlined"
                onClick={() => {
                  navigate(-1);
                }}
              >
                Back
              </ButtonWrapper>
              <ButtonWrapper
                variant="filled"
                disabled={!selectedCSOption}
                onClick={() => {
                  dispatch(SET_PROJECT_META({ activeWSTab: selectedCSOption }));
                  // After resetting other meta, also reset stabilityArr
                  dispatch(SET_AI_Track_Stability_META({ stabilityArr: [] }));
                  dispatch(SET_AI_MUSIC_Stability_META({ stabilityLoading: false }));
                  // if (
                  //   selectedCSOption === "AI Music"
                  // ) {
                  //   navigate(NavStrings.WORKSPACE_AI_MUSIC_GENERATOR, { replace: true });
                  // } else {
                  //   navigate(NavStrings.PROJECT_SETTINGS, { replace: true });
                  // }
                  navigate(NavStrings.PROJECT_SETTINGS, { replace: true });
                }}
              >
                Select
              </ButtonWrapper>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CSOptionPage;
