import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isReportModalOpen: false,
};

const reportSlice = createSlice({
  name: "NOTIFICATION",
  initialState,
  reducers: {
    SET_IS_REPORT_MODAL_OPEN: (state, action) => {
      state.isReportModalOpen = action.payload;
    },
    RESET_IS_REPORT_MODAL_OPEN: () => initialState,
  },
});

export default reportSlice.reducer;
export const { SET_IS_REPORT_MODAL_OPEN, RESET_IS_REPORT_MODAL_OPEN } =
  reportSlice.actions;