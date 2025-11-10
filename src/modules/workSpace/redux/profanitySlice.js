import { createSlice } from "@reduxjs/toolkit";
import { PROFANITY_STATUS } from "../constants/profanityStatus";

const initialState = {
  isProfanityModalOpen: false,
  purifyRequestId: null,
  expletiveWordCount: null,
  ampProfanity: null,
  expletiveWords: null,
  profanityStatus: null,
};

const profanitySlice = createSlice({
  name: "PROFANITY",
  initialState,
  reducers: {
    SET_PROFANITY_META: (state, action) => {
      let profanityObj = action.payload;
      for (const key in profanityObj) {
        if (Object.hasOwnProperty.call(profanityObj, key)) {
          const element = profanityObj[key];
          state[key] = element;
        }
      }
    },
    RESET_PROFANITY_META: () => initialState,
  },
});

export default profanitySlice.reducer;
export const { SET_PROFANITY_META, RESET_PROFANITY_META } =
  profanitySlice.actions;
