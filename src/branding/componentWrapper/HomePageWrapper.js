import React, { Suspense } from "react";
import FallBackPage from "../../common/components/FallBackPage/FallBackPage";

// Lazy load components outside the wrapper
const HomePageV3 = React.lazy(() =>
  import("../../modules/home/pages/homepageV3/HomePageV3")
);
const ShellHomePageV2 = React.lazy(() =>
  import("../../modules/home/pages/ShellHomePage/ShellHomePageV2")
);

// Separate component for rendering the accordion
const RenderHomePage = () => {
  console.log("window", window.globalConfig);
  const homePageVariant = window.globalConfig?.HOME_PAGE_VARIANT;
  switch (homePageVariant) {
    case "HOME_PAGE_VARIANT_1":
      return <ShellHomePageV2 />;
    default:
      return <HomePageV3 />;
  }
};

const HomePageWrapper = (props) => {
  return (
    <Suspense fallback={<FallBackPage />}>
      <RenderHomePage {...props} />
    </Suspense>
  );
};

export default HomePageWrapper;
