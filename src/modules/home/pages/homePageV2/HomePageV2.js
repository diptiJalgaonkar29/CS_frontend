import { useNavigate } from "react-router-dom";
import "./HomePageV2.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import Layout from "../../../../common/components/layout/Layout";
import { FormattedMessage } from "react-intl";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import { Fragment, useEffect } from "react";
import FallBackPage from "../../../../common/components/FallBackPage/FallBackPage";
import HomeProjectList from "../../components/HomeProjectList/HomeProjectList";
// import { ReactComponent as NewRightArrow } from "../../../../static/common/NewRightArrow.svg";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import {
  checkAIMusicCreateAccess,
  checkAIVoiceAccess,
} from "../../../../utils/checkAppAccess";
import { ReactComponent as Music } from "../../../../static/AI_music/AI_music.svg";
import { ReactComponent as Voice } from "../../../../static/common/voice.svg";
import { SET_PROJECT_META } from "../../../workSpace/redux/projectMetaSlice";
import { useDispatch } from "react-redux";

var crationStationOptions = [
  {
    label: "AI Music",
    isEnabled: checkAIMusicCreateAccess(),
    icon: <Music />,
  },
  {
    label: "Voice",
    isEnabled: checkAIVoiceAccess(),
    icon: <Voice />,
  },
]?.filter((data) => data?.isEnabled);

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function createProject(label) {
    // if (label === "AI Music") {
    //   navigate(NavStrings.WORKSPACE_AI_MUSIC_GENERATOR);
    // } else {
    //   navigate(NavStrings.PROJECT_SETTINGS);
    // }
    navigate(NavStrings.PROJECT_SETTINGS);
    dispatch(SET_PROJECT_META({ activeWSTab: label }));
  }

  let pathnameToRedirectAfterLogin = localStorage.getItem("pathname");

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
      <div className="homeV2_container">
        <div className="header">
          <h1 className="main_header boldFamily highlight_text">
            <FormattedMessage id="home.page.titleV2" />
          </h1>
          <p className="sub_header boldFamily">
            <FormattedMessage id="home.page.subtitleV2" />
          </p>
        </div>
        <p className="section_header">
          <IconWrapper icon="AddBordered" /> Start your project with
        </p>
        <div className="homeV2_option_container">
          {crationStationOptions?.map(({ icon, label }) => (
            <Fragment key={label}>
              <div
                className={`homeV2_option`}
                onClick={() => {
                  createProject(label);
                }}
              >
                {icon}
                <div className="homeV2_option_title">{label}</div>
              </div>
            </Fragment>
          ))}
        </div>

        <HomeProjectList />
      </div>
    </Layout>
  );
};
export default HomePage;
