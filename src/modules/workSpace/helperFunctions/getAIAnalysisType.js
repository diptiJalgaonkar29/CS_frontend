const getAIAnalysisType = (mediaTypeId) => {
  if ([1].includes(mediaTypeId)) {
    return "video";
  } else if ([4, 3].includes(mediaTypeId)) {
    return "brief";
  } else {
    return "tags";
  }
};

export default getAIAnalysisType;
