import "./Navbar.css";
import NavLinks from "./navLinks/NavLinks";
import {
  ASSET_PATHS,
  getBrandAssetPath,
} from "../../../utils/getBrandAssetMeta";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useConfig } from "../../../customHooks/useConfig";

const Navbar = ({ hideNavLinks = false }) => {
  const { messages } = useConfig();

  return (
    <div className="navbar_container">
      <ToastContainer />
      <div className="navbar_left">
        <img
          src={getBrandAssetPath(ASSET_PATHS?.NAV_LOGO_PATH)}
          className="navbar_img"
          alt="logo"
        />
        {messages?.navbar?.navItems?.navLogoText && (
          <span className="nav_logo_text boldFamily">
            {messages?.navbar?.navItems?.navLogoText}
          </span>
        )}
      </div>
      <div className="navbar_right">{!hideNavLinks && <NavLinks />}</div>
    </div>
  );
};

export default Navbar;
