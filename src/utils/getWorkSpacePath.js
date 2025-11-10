import NavStrings from "../routes/constants/NavStrings";

const getWorkSpacePath = (projectID, cueID) => {
  if (projectID && cueID) {
    return `${NavStrings.WORKSPACE}/${projectID}/${cueID}`;
  } else if (projectID && !cueID) {
    return `${NavStrings.WORKSPACE}/${projectID}`;
  } else {
    return NavStrings.WORKSPACE;
  }
};

export default getWorkSpacePath;
