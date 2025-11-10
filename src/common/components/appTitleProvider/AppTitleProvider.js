import React, { useEffect } from "react";
import getSuperBrandName from "../../../utils/getSuperBrandName";
import NavStrings from "../../../routes/constants/NavStrings";
import { brandConstants } from "../../../utils/brandConstants";
import capitalizeFirstLetter from "../../../utils/capitalizeFirstLetter";
import { useLocation } from "react-router-dom";
import getBrandName from "../../../utils/getBrandName";

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

const AppTitleProvider = ({ messages }) => {
  let { pathname } = useLocation();
  useEffect(() => {
    applyDocumentTitle();
  }, [pathname]);

  const applyDocumentTitle = () => {
    let pageTitle;
    // let brandNameTitle = getSuperBrandName().toUpperCase();
    let brandNameTitle = [
      brandConstants.SONIC_SPACE,
      brandConstants.AMP,
    ].includes(superBrandName)
      ? "Sonic Hub"
      : capitalizeFirstLetter(superBrandName);

    brandNameTitle = window.globalConfig?.IS_SHELL_BRAND
      ? "Shell AI Voice Generator"
      : brandNameTitle;

    switch (pathname) {
      case NavStrings.HOME:
        pageTitle = messages?.navbar?.navItems?.creationStation;
        break;
      case NavStrings.PROJECTS:
        pageTitle = messages?.navbar?.navItems?.myProject;
        break;
      case (pathname.match(NavStrings.WORKSPACE) || {}).input:
        pageTitle = messages?.navbar?.navItems?.workSpace;
        break;
      default:
        pageTitle = "";
        break;
    }
    let toolName =
      superBrandName === brandConstants.MASTERCARD
        ? "Sonic Station"
        : "Creation Station";
    if (pageTitle) {
      // document.title = pageTitle + " - " + toolName + " | " + brandNameTitle;
      document.title = pageTitle + " | " + brandNameTitle;
    } else {
      document.title = toolName + " | " + brandNameTitle;
    }
  };
  return <></>;
};

export default AppTitleProvider;
