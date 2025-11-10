import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loaderStatus: { loaderStatus: false, loaderProgressPercent: 0 },
};

const loaderSlice = createSlice({
  name: "LOADER",
  initialState,
  reducers: {
    SET_LOADING_STATUS: (state, action) => {
      state.loaderStatus = action.payload;
    },
    RESET_LOADING_STATUS: () => initialState,
  },
});

export default loaderSlice.reducer;
export const { SET_LOADING_STATUS, RESET_LOADING_STATUS } = loaderSlice.actions;
