import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationMeta: { type: "", msg: "" },
};

const notificationSlice = createSlice({
  name: "NOTIFICATION",
  initialState,
  reducers: {
    SET_NOTIFICATION: (state, action) => {
      state.notificationMeta = action.payload;
    },
    RESET_NOTIFICATION: (state) => {
      state.notificationMeta = { type: "", msg: "" };
    },
  },
});

export default notificationSlice.reducer;
export const { SET_NOTIFICATION, RESET_NOTIFICATION } =
  notificationSlice.actions;
