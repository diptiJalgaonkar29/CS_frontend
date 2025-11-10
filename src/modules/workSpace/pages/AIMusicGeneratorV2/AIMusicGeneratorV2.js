import React, { useState } from "react";
import "./AIMusicGeneratorV2.css";
import Layout from "../../../../common/components/layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { FormattedMessage } from "react-intl";
import NavStrings from "../../../../routes/constants/NavStrings";
import AIMusicGeneratorOptions from "../../helperFunctions/AIMusicGeneratorOptions";
import { useDispatch } from "react-redux";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import { SideBarMusicStyleSelector } from "../../components/SideBarMusicStyleSelector/SideBarMusicStyleSelector";
import AIMusicGeneratorV2WithBrief from "../AIMusicGeneratorV2WithBrief/AIMusicGeneratorV2WithBrief";
import AIMusicGeneratorV2WithVideo from "../AIMusicGeneratorV2WithVideo/AIMusicGeneratorV2WithVideo";

const AIMusicGeneratorV2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedOption = queryParams.get("option") || "all";

  const handleOptionClick = (key) => {
    if (["brief", "video", "tags"].includes(selectedOption)) {
      return;
    } else if (selectedOption === key) {
      return;
    } else {
      dispatch(
        SET_AI_MUSIC_META({
          aiMusicGeneratorOption: key,
        })
      );
      navigate(`${NavStrings.PROJECT_SETTINGS}?option=${key}`);
    }
  };

  const selectedConfig = AIMusicGeneratorOptions.find(
    (option) => option.key === selectedOption
  );
  const RightPanelComponent = selectedConfig?.Component;

  return (
    <Layout>
      <div className="AIMusicGenerator_container">
        <div className="content">
          {/* selection cards */}
          <div className="cards-grid">
            {AIMusicGeneratorOptions?.map(({ key, icon, title, subTitle }) => (
              <div
                id={key}
                className={`card ${
                  selectedOption === key || selectedOption === "all"
                    ? "card-active"
                    : "card-not-active"
                }`}
                key={key}
                onClick={() => handleOptionClick(key)}
              >
                {selectedOption !== "all" ? (
                  <div className="card-icon">
                    <h2>{title}</h2>
                    <IconWrapper icon={icon} />
                  </div>
                ) : (
                  <>
                    <div className="card-icon">
                      <IconWrapper icon={icon} />
                    </div>
                    <h2>{title}</h2>
                  </>
                )}
                <p>{subTitle}</p>
                {selectedOption === "video" && key === "video" && (
                  <AIMusicGeneratorV2WithVideo />
                )}
                {selectedOption === "brief" && key === "brief" && (
                  <AIMusicGeneratorV2WithBrief />
                )}

                {selectedOption === "tags" && key === "tags" && (
                  <div className="card_genrate_btn">
                    <SideBarMusicStyleSelector />
                  </div>
                )}
              </div>
            ))}

            {/* <ButtonWrapper
              className="card_genrate_btn"
              variant="filled"
              disabled={
                selectedOption === "all"
              }
              onClick={generateTracks}
            >
              Generate
            </ButtonWrapper> */}
          </div>

          <>
            {RightPanelComponent ? (
              <div className="AISearch_Content">
                <RightPanelComponent />
              </div>
            ) : (
              <div className="AISearch_Content">
                <div className="header">
                  <h1>
                    <FormattedMessage id={"workspace.AIMusicGenerator.title"} />
                  </h1>
                  <p className="subtitle">
                    <FormattedMessage
                      id={"workspace.AIMusicGenerator.subtitle"}
                    />
                  </p>
                  <p className="option_selection_title">
                    <FormattedMessage
                      id={"workspace.AIMusicGenerator.optionSelectionTitle"}
                    />
                  </p>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </Layout>
  );
};

export default AIMusicGeneratorV2;
