import React from "react";
import "./AIMusicGenerator.css";
import Layout from "../../../../common/components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { FormattedMessage } from "react-intl";
import NavStrings from "../../../../routes/constants/NavStrings";
import AIMusicGeneratorOptions from "../../helperFunctions/AIMusicGeneratorOptions";
import { useDispatch } from "react-redux";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";

const AIMusicGenerator = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const handleOptionClick = (key) => {
    console.log("key", key);
    dispatch(
      SET_AI_MUSIC_META({
        aiMusicGeneratorOption: key
      })
    )
    navigate(`${NavStrings.PROJECT_SETTINGS}?option=${key}`);
  };

  return (
    <Layout>
      <div className="AIMusicGenerator_container">
        <div className="content">
          {/* header */}
          <div className="header">
            <h1>
              <FormattedMessage id={"workspace.AIMusicGenerator.title"} />
            </h1>
            <p className="subtitle">
              <FormattedMessage id={"workspace.AIMusicGenerator.subtitle"} />
            </p>
            <p className="option_selection_title">
              <FormattedMessage
                id={"workspace.AIMusicGenerator.optionSelectionTitle"}
              />
            </p>
          </div>
          {/* selection cards */}
          <div className="cards-grid">
            {AIMusicGeneratorOptions?.map(({ key, icon, title, subTitle }) => (
              <div
                // id={key}
                className="card"
                key={key}
                onClick={() => handleOptionClick(key)}
              >
                <div className="card-icon">
                  <IconWrapper icon={icon} />
                </div>
                <h2>{title}</h2>
                <p>{subTitle}</p>
              </div>
            ))}
          </div>
          {/* back btn */}
          <Link to="/" className="back-link">
            <IconWrapper icon="LeftArrow" />
            <FormattedMessage id={"workspace.AIMusicGenerator.BackBtn"} />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AIMusicGenerator;
