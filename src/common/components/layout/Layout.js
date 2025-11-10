import React from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import "./Layout.css";
import CustomLoader from "../customLoader/CustomLoader";
import { useSelector } from "react-redux";
import useAppType from "../../../customHooks/useAppType";
import ReportBugModal from "../ReportBugModal/ReportBugModal";
import AppTitleProvider from "../appTitleProvider/AppTitleProvider";
import { useConfig } from "../../../customHooks/useConfig";

const Layout = ({ hideNavLinks = false, fullWidth = false, children }) => {
  const {
    loaderStatus: { loaderStatus, loaderProgressPercent },
  } = useSelector((state) => state.loader);
  const { appType } = useAppType();
  const { messages } = useConfig();

  return (
    <>
      <div className={`layout_container ${appType}`}>
        {loaderStatus && (
          <CustomLoader processPercent={loaderProgressPercent} />
        )}
        <AppTitleProvider messages={messages} />
        <Navbar hideNavLinks={hideNavLinks} />
        <div className={`layout_content ${fullWidth && "full_width"}`}>
          {children}
        </div>
        <Footer />
      </div>
      <ReportBugModal />
    </>
  );
};

export default Layout;
