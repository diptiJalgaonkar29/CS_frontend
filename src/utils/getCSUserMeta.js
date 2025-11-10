import { store } from "../reduxToolkit/store";

const getCSUserMeta = () => {
  const { CSToken, SSToken, brandMeta, authMeta, appAccess } =
    store.getState()?.auth;

  return { CSToken, SSToken, brandMeta, authMeta, appAccess };
};
export default getCSUserMeta;
