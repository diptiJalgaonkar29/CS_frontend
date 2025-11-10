import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allSonicLogoTracks: [],
  sonicLogoRecommendedTracks: [],
  isFetched: false,
};

const sonicLogoTrackSlice = createSlice({
  name: "SONIC_LOGO_TRACK",
  initialState,
  reducers: {
    SET_SONIC_LOGO_TRACK_META: (state, action) => {
      let sonicLogoTrackObj = action.payload;
      for (const key in sonicLogoTrackObj) {
        if (Object.hasOwnProperty.call(sonicLogoTrackObj, key)) {
          const element = sonicLogoTrackObj[key];
          state[key] = element;
        }
      }
    },
    RESET_SONIC_LOGO_TRACK_META: () => initialState,
  },
});

export default sonicLogoTrackSlice.reducer;
export const { SET_SONIC_LOGO_TRACK_META, RESET_SONIC_LOGO_TRACK_META } =
  sonicLogoTrackSlice.actions;
