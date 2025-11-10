import React, { useState } from "react";
import getAIAnalysisType from "../../modules/workSpace/helperFunctions/getAIAnalysisType";

const DescSeeMorejs = ({ selectedAIAnalysis, selectedOption, subTitle }) => {
    const [expanded, setExpanded] = useState(false);

    const shouldShow =
        getAIAnalysisType(+selectedAIAnalysis?.mediatype) === selectedOption;

    if (!shouldShow) return subTitle;

    const desc = selectedAIAnalysis?.description?.replace(/\\n/g, "") || "";
    const words = desc.trim().split(/\s+/);

    const isLong = words.length > 20;
    const displayText = expanded || !isLong
        ? desc
        : words.slice(0, 20).join(" ") + "...";

    return (
        <div>
            <p>{displayText}</p>
            {isLong && (
                <button onClick={() => setExpanded(!expanded)} style={{ color: "var(--color-primary)", background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {expanded ? "See less" : "See more"}
                </button>
            )}
        </div>
    );
};

export default DescSeeMorejs;
