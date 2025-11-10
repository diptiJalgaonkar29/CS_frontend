import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectID: "",
  projectName: "",
  projectDescription: "",
  assetsType: "",
  projectDurationInsec: 0,
  cueID: "",
  activeWSTab: "",
  isVideoPlaying: false,
  isVideoLoading: false,
  isVideoProcessing: false,
  timelineSeekTime: 0,
  // timelineVoiceVolume: 0.6,
  // timelineMusicVolume: 0.4,
  timelineVoiceVolume: 1,
  timelineMusicVolume: 1,
  isTimelinePlaying: false,
};

const projectMetaSlice = createSlice({
  name: "PROJECT_NAME",
  initialState,
  reducers: {
    SET_PROJECT_META: (state, action) => {
      let projectMetaObj = action.payload;
      for (const key in projectMetaObj) {
        if (Object.hasOwnProperty.call(projectMetaObj, key)) {
          const element = projectMetaObj[key];
          state[key] = element;
        }
      }
    },
    RESET_PROJECT_META: () => initialState,
  },
});

export default projectMetaSlice.reducer;
export const { SET_PROJECT_META, RESET_PROJECT_META } =
  projectMetaSlice.actions;
