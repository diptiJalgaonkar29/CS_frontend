import React, { useEffect } from "react";
import FallBackPage from "../../../../common/components/FallBackPage/FallBackPage";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { useConfig } from "../../../../customHooks/useConfig";
import { useDispatch } from "react-redux";
import { REMOVE_AUTH_STATE } from "../../redux/authSlice";
import { RESET_NOTIFICATION_TOP_BAR } from "../../../../common/redux/notificationTopBarSlice";
import { persistor } from "../../../../reduxToolkit/store";

const LogoutPage = () => {
  const { jsonConfig } = useConfig();
  const dispatch = useDispatch();

  useEffect(() => {
    let { brandMeta } = getCSUserMeta();
    dispatch(REMOVE_AUTH_STATE());
    dispatch(RESET_NOTIFICATION_TOP_BAR());

    // Dispatch the action to reset the in-memory redux store
    dispatch({ type: "RESET" });

    // Purge the persisted state from storage (localStorage)
    persistor
      .purge()
      .then(() => {
        console.log("Persisted state has been purged");
      })
      .finally(() => {
        window.open(
          `${
            brandMeta?.redirectUrl ||
            (process.env.NODE_ENV === "development"
              ? "http://localhost:3099"
              : jsonConfig?.MUSIC_BANK_DOMAIN)
          }/#/logout?cs-logout=true`,
          "_self"
        );
      });
  }, []);

  return <FallBackPage />;
};

export default LogoutPage;
