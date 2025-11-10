import React, { useEffect } from "react";
import "./CustomNotificationTopBar.css";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import { useDispatch, useSelector } from "react-redux";
import { SET_NOTIFICATION_TOP_BAR } from "../../redux/notificationTopBarSlice";
import getPostLoginBanner from "../../../utils/getPostLoginBanner";
import getPreLoginBanner from "../../../utils/getPreLoginBanner";

const CustomNotificationTopBar = () => {
  const { isVisible, isClosed, msg } = useSelector(
    (state) => state.notificationTopBar
  );
  const { authMeta } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (authMeta?.status) {
      // console.log("LOGGED IN!!!!");
      getPostLoginBanner({ isVisible, isClosed, msg });
    } else {
      // console.log("NOT LOGGED IN!!!!");
      getPreLoginBanner({ isVisible, isClosed, msg });
    }
  }, [authMeta?.status]);

  const onClose = () => {
    dispatch(
      SET_NOTIFICATION_TOP_BAR({
        isClosed: true,
      })
    );
  };

  if (!isVisible || isClosed || !msg) {
    return <></>;
  } else {
    return (
      <div className="CustomNotificationTopBar_container">
        <p
          className="CustomNotificationTopBar_text"
          dangerouslySetInnerHTML={{
            __html: msg,
          }}
        />
        <IconWrapper
          icon="Close"
          className="CustomNotificationTopBar_close_btn"
          onClick={onClose}
        />
      </div>
    );
  }
};

export default CustomNotificationTopBar;
