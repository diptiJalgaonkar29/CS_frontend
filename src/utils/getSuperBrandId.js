import getSuperBrandName from "./getSuperBrandName";

const getSuperBrandId = () => {
  let LocalStotageSuperBrandId = localStorage.getItem("superBrandId");
  if (!!LocalStotageSuperBrandId) {
    return LocalStotageSuperBrandId;
  }
  let superBrandName = getSuperBrandName();
  const { REACT_APP_BRAND_ID } = process.env;

  let superBrandId;
  superBrandId =
    process.env?.[`REACT_APP_BRAND_ID_${superBrandName.toUpperCase()}`] ||
    REACT_APP_BRAND_ID;
  if (process.env.NODE_ENV === "development") {
    superBrandId = 1;
  }
  localStorage.setItem("superBrandId", superBrandId);
  console.log("superbrandid",superBrandId, superBrandName)
  return superBrandId;
};

export default getSuperBrandId;
