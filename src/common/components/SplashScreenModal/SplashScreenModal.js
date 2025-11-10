import React, { useEffect, useState } from "react";
import "./SplashScreenModal.css";
import getClientMeta from "../../../utils/getClientMeta";
import ModalWrapper from "../../../branding/componentWrapper/ModalWrapper";
import { useConfig } from "../../../customHooks/useConfig";

const SplashScreenModal = () => {
  const [isSplashScreenModalOpen, setIsSplashScreenModalOpen] = useState(false);
  const [SplashScreenMsg, setSplashScreenMsg] = useState("");
  let { jsonConfig } = useConfig();
  useEffect(() => {
    let detectedBrowser = getClientMeta().browserName;
    if (
      !jsonConfig?.APP_SUPPORTED_BROWSER_LIST?.includes(detectedBrowser) &&
      jsonConfig?.SHOW_SPLASH_SCREEN
    ) {
      setSplashScreenMsg(jsonConfig?.SPLASH_SCREEN_TEXT);
      setIsSplashScreenModalOpen(true);
      document.body.style.pointerEvents = "none";
    }
  }, []);

  const onClose = () => {
    setIsSplashScreenModalOpen(false);
  };

  return (
    <ModalWrapper
      isOpen={isSplashScreenModalOpen}
      onClose={onClose}
      title={"Welcome to Creation Station!"}
      className="splash_screen"
    >
      <p className="splash_screen_text">{SplashScreenMsg}</p>
    </ModalWrapper>
  );
};

export default SplashScreenModal;
