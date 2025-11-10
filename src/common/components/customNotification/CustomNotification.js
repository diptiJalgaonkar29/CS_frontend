import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESET_NOTIFICATION } from "../../redux/notificationSlice";
import "./CustomNotification.css";

const CustomNotification = () => {
  const dispatch = useDispatch();
  const { notificationMeta } = useSelector((state) => state.notification);

  useEffect(() => {
    let timerID;
    if (notificationMeta?.msg) {
      timerID = setTimeout(() => {
        dispatch(RESET_NOTIFICATION());
      }, notificationMeta?.duration || 3000);
    }
    return () => clearTimeout(timerID);
  }, [notificationMeta?.msg]);

  if (!notificationMeta?.msg) return;

  return (
    <div className={`${notificationMeta?.type} notification_container`}>
      <p className="msg_text">{notificationMeta?.msg}</p>
    </div>
  );
};

export default CustomNotification;
