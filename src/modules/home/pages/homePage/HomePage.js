import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import Layout from "../../../../common/components/layout/Layout";
import RecentProjectsCarousel from "../../components/recentProjectsCarousel/RecentProjectsCarousel";
import { FormattedMessage } from "react-intl";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import { useEffect } from "react";
import FallBackPage from "../../../../common/components/FallBackPage/FallBackPage";

const SubTitleByAppType = ({ appType }) => {
  switch (appType) {
    case APP_TYPES.AI_VOICE:
      return <FormattedMessage id="home.page.onlyVoiceTitleSubtextHighlight" />;
    case APP_TYPES.AI_MUSIC:
      return <FormattedMessage id="home.page.onlyMusicTitleSubtextHighlight" />;
    default:
      return <FormattedMessage id="home.page.titleSubtextHighlight" />;
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const { appType } = useAppType();

  function createProject(appType) {
    switch (appType) {
      case APP_TYPES.AI_VOICE:
        navigate(NavStrings.PROJECT_SETTINGS);
        return;
      case APP_TYPES.AI_MUSIC:
        navigate(NavStrings.PROJECT_SETTINGS);
        return;
      default:
        navigate(NavStrings.CS_OPTIONS);
        return;
    }
  }

  let pathnameToRedirectAfterLogin = localStorage.getItem("pathname");
  // console.log("pathnameToRedirectAfterLogin", pathnameToRedirectAfterLogin);

  useEffect(() => {
    if (!!pathnameToRedirectAfterLogin) {
      localStorage.removeItem("pathname");
      navigate(pathnameToRedirectAfterLogin);
    }
  }, [pathnameToRedirectAfterLogin]);

  if (!!pathnameToRedirectAfterLogin) {
    return <FallBackPage />;
  }

  return (
    <Layout>
      <div className="home_container">
        <div className="header">
          <p className="sub_header boldFamily">
            <FormattedMessage id="home.page.titleSubtext" />
          </p>
          <h1 className="main_header boldFamily highlight_text">
            <SubTitleByAppType appType={appType} />
          </h1>
          <div
            className="create_block card_container"
            onClick={() => createProject(appType)}
          >
            <p> + Create a New Project</p>
          </div>
        </div>
        <RecentProjectsCarousel />
      </div>
    </Layout>
  );
};
export default HomePage;
