import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const AITrackReportSlice = createSlice({
  name: "AITRACKS",
  initialState,
  reducers: {
    SET_USER_TRACKING_DATA: (state, action) => {
      return {
        ...state,
        data: action.payload,
      };
    },
    SET_SELECTED_USER_CONFIG: (state, action) => {
      return {
        ...state,
        data: action.payload,
      };
    },
    RESET_USER_TRACKING_DATA: () => initialState,
  },
});

export default AITrackReportSlice.reducer;
export const {
  SET_SELECTED_USER_CONFIG,
  RESET_USER_TRACKING_DATA,
  SET_USER_TRACKING_DATA,
} = AITrackReportSlice.actions;
