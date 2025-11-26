import React from "react";
import "./AIMusicGeneratorSelectedOption.css";
import Layout from "../../../../common/components/layout/Layout";
import AITrackCreationWithTags from "../../components/AITrackCreationWithTags/AITrackCreationWithTags";
import { useParams } from "react-router-dom";
import AITrackCreationWithBrief from "../../components/AITrackCreationWithBrief/AITrackCreationWithBrief";
import AITrackCreationWithVideo from "../../components/AITrackCreationWithVideo/AITrackCreationWithVideo";

const AIMusicGeneratorSelectedOption = () => {
  const { option } = useParams();
  const renderSelectedOptionUI = (option) => {
    switch (option) {
      case "video":
        return <AITrackCreationWithVideo />;
      case "brief":
        return <AITrackCreationWithBrief />;
      case "tags":
        return <AITrackCreationWithTags />;

      default:
        break;
    }
  };
  return (
    <Layout>
      <div className="AIMusic_parent_container">
        <div className="AIMusicGeneratorSelectedOption_container">
        {renderSelectedOptionUI(option)}
      </div>
      </div>
    </Layout>
  );
};

export default AIMusicGeneratorSelectedOption;
