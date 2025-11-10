import { SET_NOTIFICATION } from "../redux/notificationSlice";
import { store } from "../../reduxToolkit/store";

const showNotification = (type, msg, duration = 3000) => {
  //type = SUCCESS/WARNING/ERRORS
  const dispatch = store.dispatch;
  dispatch(
    SET_NOTIFICATION({
      type,
      msg,
      duration,
    })
  );
};

export default showNotification;
