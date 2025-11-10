import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appVersion: null,
};

const commonSlice = createSlice({
  name: "COMMON",
  initialState,
  reducers: {
    SET_APP_VERSION: (state, action) => {
      state.appVersion = action.payload;
    },
  },
});

export default commonSlice.reducer;
export const { SET_APP_VERSION } = commonSlice.actions;
