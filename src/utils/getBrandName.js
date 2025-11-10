import { store } from "../reduxToolkit/store";

const getBrandName = () => {
  const { auth } = store.getState();
  return auth?.authMeta?.brandName?.toLowerCase();
};

export default getBrandName;
