import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FallBackPage from "../../common/components/FallBackPage/FallBackPage";
import NavStrings from "../constants/NavStrings";
import ProtectedRoute from "./ProtectedRoute";
import { setFavicon } from "../../utils/setFavicon";
import CustomNotificationTopBar from "../../common/components/customNotificationTopBar/CustomNotificationTopBar";
import CustomNotification from "../../common/components/customNotification/CustomNotification";
import SplashScreenModal from "../../common/components/SplashScreenModal/SplashScreenModal";
import ScrollToTopButton from "../../common/components/scrollToTopButton/ScrollToTopButton";
import getSuperBrandName from "../../utils/getSuperBrandName";
import { ASSET_PATHS, getBrandAssetPath } from "../../utils/getBrandAssetMeta";
import { useSelector } from "react-redux";
import HomePageWrapper from "../../branding/componentWrapper/HomePageWrapper";

const MusicBankCSPage = lazy(() =>
  import("../../modules/auth/pages/MusicBankCSPage/MusicBankCSPage")
);

const UnauthorizedPage = lazy(() =>
  import("../../modules/auth/pages/UnauthorizedPage/UnauthorizedPage")
);

const HomePage = lazy(() =>
  import("../../modules/home/pages/homePage/HomePage")
);

const HomePageV2 = lazy(() =>
  import("../../modules/home/pages/homePageV2/HomePageV2")
);

const CSOptionPage = lazy(() =>
  import("../../modules/workSpace/pages/CSOptionPage/CSOptionPage")
);

const UploadVideoPage = lazy(() =>
  import("../../modules/workSpace/pages/uploadVideoPage/UploadVideoPage")
);

const FlaxTrackProccessPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/FlaxTrackProccessPage/FlaxTrackProccessPage"
  )
);

const AITrackGenerationPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/AITrackGenerationPage/AITrackGenerationPage"
  )
);

const RecentAITracksPage = lazy(() =>
  import("../../modules/workSpace/pages/RecentAITracksPage/RecentAITracksPage")
);

const WorkSpacePage = lazy(() =>
  import("../../modules/workSpace/pages/workSpacePage/WorkSpacePage")
);

const WorkSpaceProjectPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/WorkSpaceProjectPage/WorkSpaceProjectPage"
  )
);

const AIMusicGeneratorPage = lazy(() =>
  import("../../modules/workSpace/pages/AIMusicGeneratorV2/AIMusicGeneratorV2")
);

const AIMusicGeneratorSelectedOptionPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/AIMusicGeneratorSelectedOption/AIMusicGeneratorSelectedOption"
  )
);

const BrandTagsPage = lazy(() =>
  import("../../modules/workSpace/pages/BrandTagsPage/BrandTagsPage")
);

const CreateProjectPage = lazy(() =>
  import("../../modules/workSpace/pages/CreateProjectPage/CreateProjectPage")
);

const ProjectsPage = lazy(() =>
  import("../../modules/projects/pages/projectsPage/ProjectsPage")
);

const AudioRetentionPage = lazy(() =>
  import("../../modules/workSpace/pages/AudioRetentionPage/AudioRetentionPage")
);

const LikeDislikeCueIdReportPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/LikeDislikeCueIdReportPage/LikeDislikeCueIdReportPage"
  )
);
const MonthWiseCueIdReportPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/MonthWiseCueIdReportPage/MonthWiseCueIdReportPage"
  )
);
const MonthWiseAITrackDetailsReportPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/MonthWiseCueIdReportPage/DetailsPage/MonthWiseCueIdDetailPage"
  )
);
const VoiceTrackReportPage = lazy(() =>
  import(
    "../../modules/workSpace/pages/VoiceTrackReportPage/VoiceTrackReportPage"
  )
);

const DictReportPage = lazy(() =>
  import("../../modules/workSpace/pages/DictReport/DictReport")
);

const NotFound = lazy(() => import("../pages/NoMatchPage/NoMatchPage"));
const LogoutPage = lazy(() =>
  import("../../modules/auth/pages/LogoutPage/LogoutPage")
);
const ShellHomePageV2 = lazy(() =>
  import("../../modules/home/pages/ShellHomePage/ShellHomePageV2")
);

const superBrandName = getSuperBrandName();

const Router = () => {
  useEffect(() => {
    setFavicon(getBrandAssetPath(ASSET_PATHS?.FAVICON_PATH));
  }, []);

  const { authMeta } = useSelector((state) => state?.auth);
  const isWPP = window.globalConfig?.WPP;

  return (
    <>
      <CustomNotificationTopBar />
      <CustomNotification />
      <SplashScreenModal />
      <ScrollToTopButton />
      <BrowserRouter>
        <Suspense fallback={<FallBackPage />}>
          <Routes>
            <Route path={NavStrings.SONIC_CS} element={<MusicBankCSPage />} />
            <Route path={NavStrings.LOGOUT} element={<LogoutPage />} />
            <Route
              path={NavStrings.SONIC_CS_FROM}
              element={<MusicBankCSPage />}
            />
            <Route
              path={NavStrings.UNAUTHORIZED}
              element={<UnauthorizedPage />}
            />
            <Route
              path={NavStrings.HOME}
              element={
                <ProtectedRoute>
                  <HomePageWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.CS_OPTIONS}
              element={
                <ProtectedRoute>
                  <CSOptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.UPLOAD_VIDEO}
              element={
                <ProtectedRoute>
                  <UploadVideoPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={NavStrings.RECENT_AI_MUSIC}
              element={
                <ProtectedRoute>
                  <RecentAITracksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.WORKSPACE_BY_PROJECT_ID_AND_CUE_ID_OPTIONS}
              element={
                <ProtectedRoute>
                  <WorkSpacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-space/stability/:project_id"
              element={
                <ProtectedRoute>
                  <WorkSpacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.WORKSPACE_PROJECT}
              element={
                <ProtectedRoute>
                  <WorkSpaceProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.WORKSPACE_AI_MUSIC_GENERATOR}
              element={
                <ProtectedRoute>
                  <AIMusicGeneratorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.WORKSPACE_AI_MUSIC_GENERATOR_OPTIONS}
              element={
                <ProtectedRoute>
                  <AIMusicGeneratorSelectedOptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.FLAX_TRACK}
              element={
                <ProtectedRoute>
                  <FlaxTrackProccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.AI_TRACK_GENERATION}
              element={
                <ProtectedRoute>
                  <AITrackGenerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.BRAND_TAGS}
              element={
                <ProtectedRoute>
                  <BrandTagsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={NavStrings.PROJECT_SETTINGS}
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.FLAX_PROJECT_SETTINGS}
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.PROJECTS}
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.RETAIN_AUDIO}
              element={
                <ProtectedRoute>
                  <AudioRetentionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.LIKE_DISLIKE_CUE_ID_REPORT}
              element={
                <ProtectedRoute>
                  <LikeDislikeCueIdReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.MONTH_WISE_AI_TRACK_GENERATED_REPORT}
              element={
                <ProtectedRoute>
                  <MonthWiseCueIdReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.MONTH_WISE_AI_TRACK_DETAILS}
              element={
                <ProtectedRoute>
                  <MonthWiseAITrackDetailsReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.VOICE_TRACK_REPORT}
              element={
                <ProtectedRoute>
                  <VoiceTrackReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={NavStrings.DICT_REPORT}
              element={
                <ProtectedRoute>
                  <DictReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default Router;
