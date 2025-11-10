import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  voicesList: [],
  isVoicesListFetching: false,
  favVoicesList: [],
  popularVoicesList: [],
};

const voicesListSlice = createSlice({
  name: "SELECTED_VOICES",
  initialState,
  reducers: {
    ADD_VOICES_LIST: (state, action) => {
      state.voicesList = action.payload;
    },
    REMOVE_VOICE_LIST: (state) => {
      state.voicesList = [];
    },
    SET_VOICE_LIST_META: (state, action) => {
      let voiceObj = action.payload;
      for (const key in voiceObj) {
        if (Object.hasOwnProperty.call(voiceObj, key)) {
          const element = voiceObj[key];
          state[key] = element;
        }
      }
    },
    RESET_VOICE_LIST_META: () => initialState,
  },
});

export default voicesListSlice.reducer;
export const {
  ADD_VOICES_LIST,
  REMOVE_VOICE_LIST,
  SET_VOICE_LIST_META,
  RESET_VOICE_LIST_META,
} = voicesListSlice.actions;
