import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskDetailTableSort: { field: "changetimestamp", order: "desc" },
  cueTrackMeta: {
    title: "",
    src: "",
    cueId: "",
    isLoading: false,
    isPlaying: false,
  },
  selectedNoteId: "",
};

const tableSlice = createSlice({
  name: "TASK",
  initialState,
  reducers: {
    SET_TABLE_META: (state, action) => {
      let taskObj = action.payload;
      for (const key in taskObj) {
        if (Object.hasOwnProperty.call(taskObj, key)) {
          const element = taskObj[key];
          state[key] = element;
        }
      }
    },
    RESET_TABLE_STATE: () => initialState,
    SET_CUE_TRACK_META: (state, action) => {
      let trackObj = action.payload;
      for (const key in trackObj) {
        if (Object.hasOwnProperty.call(trackObj, key)) {
          const element = trackObj[key];
          state.cueTrackMeta[key] = element;
        }
      }
    },
    RESET_CUE_TRACK_META: (state) => {
      state.cueTrackMeta = initialState.cueTrackMeta;
    },
  },
});

export default tableSlice.reducer;
export const {
  SET_TABLE_META,
  RESET_TABLE_STATE,
  SET_CUE_TRACK_META,
  RESET_CUE_TRACK_META,
} = tableSlice.actions;
