import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  isClosed: false,
  msg: "",
};

const notificationTopBarSlice = createSlice({
  name: "NOTIFICATION_TOP_BAR",
  initialState,
  reducers: {
    SET_NOTIFICATION_TOP_BAR: (state, action) => {
      let notificationTopBarObj = action.payload;
      for (const key in notificationTopBarObj) {
        if (Object.hasOwnProperty.call(notificationTopBarObj, key)) {
          const element = notificationTopBarObj[key];
          state[key] = element;
        }
      }
    },
    RESET_NOTIFICATION_TOP_BAR: () => initialState,
  },
});

export default notificationTopBarSlice.reducer;
export const { SET_NOTIFICATION_TOP_BAR, RESET_NOTIFICATION_TOP_BAR } =
  notificationTopBarSlice.actions;
