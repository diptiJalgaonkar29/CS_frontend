import "./AppVersionBadge.css";
import { useConfig } from "../../../customHooks/useConfig";

const AppVersionBadge = () => {
  let { jsonConfig } = useConfig();

  return <p className="app_version">{jsonConfig?.APP_VERSION}</p>;
};
export default AppVersionBadge;
