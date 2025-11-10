import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  AIMusicConfigByBrand: [],
};

const AIMusicbrandConfigsSlice = createSlice({
  name: "AI_MUSIC_BRAND_CONFIG",
  initialState,
  reducers: {
    SET_AI_MUSIC_BRAND_CONFIG_META: (state, action) => {
      let AIMusicObj = action.payload;
      for (const key in AIMusicObj) {
        if (Object.hasOwnProperty.call(AIMusicObj, key)) {
          const element = AIMusicObj[key];
          state[key] = element;
        }
      }
    },
    RESET_AI_MUSIC_BRAND_CONFIG_META: () => initialState,
  },
});

export default AIMusicbrandConfigsSlice.reducer;
export const {
  SET_AI_MUSIC_BRAND_CONFIG_META,
  RESET_AI_MUSIC_BRAND_CONFIG_META,
} = AIMusicbrandConfigsSlice.actions;
