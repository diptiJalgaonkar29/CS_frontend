import React, { Suspense, useEffect } from "react";
import "./index.css";
import { persistor, store } from "./reduxToolkit/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Router from "./routes/components/Router";
import ClearCache from "react-clear-cache";
import getSuperBrandName from "./utils/getSuperBrandName";
// import BrandingProvider from "./branding/provider/BrandingProvider";
// import BrandingProviderWPP from "./branding/provider/BrandingProviderWPP";
import { brandConstants } from "./utils/brandConstants";
import FallBackPage from "./common/components/FallBackPage/FallBackPage";
import getSuperBrandId from "./utils/getSuperBrandId";
import { setLoginStatusChecker } from "./utils/tokenExpiry";
// import getConfigJson from "./utils/getConfigJson";

const BrandingProvider = React.lazy(() =>
  import("./branding/provider/BrandingProvider")
);
const BrandingProviderWPP = React.lazy(() =>
  import("./branding/provider/BrandingProviderWPP")
);

const WPPApp = () => (
  <Suspense fallback={<FallBackPage />}>
    <BrandingProviderWPP>
      <Router />
    </BrandingProviderWPP>
  </Suspense>
);

const DefaultApp = () => (
  <Suspense fallback={<FallBackPage />}>
    <BrandingProvider>
      <Router />
    </BrandingProvider>
  </Suspense>
);

const App = () => {
  // remove all classnames from body tag
  // document.body.classList.forEach((cls) => document.body.classList.remove(cls));

  useEffect(() => {
    localStorage.removeItem("superBrandName");
    localStorage.removeItem("superBrandId");
    getSuperBrandName();
    getSuperBrandId();
    setLoginStatusChecker();
    // console.log("getConfigJson", getConfigJson())
  }, []);

  // console.log(superBrandName, "Brandname cs");

  return (
    <ClearCache auto={true}>
      {({ isLatestVersion, emptyCacheStorage }) => {
        if (!isLatestVersion) {
          emptyCacheStorage();
          localStorage.clear();
          document.cookie = `mu-logstatus=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Strict`;
        }
        return (
          <Provider store={store}>
            <PersistGate persistor={persistor}>
              {getSuperBrandName() == brandConstants.WPP ? (
                <WPPApp />
              ) : (
                <DefaultApp />
              )}
              {/* <WPPApp /> */}
            </PersistGate>
          </Provider>
        );
      }}
    </ClearCache>
  );
};
export default App;
