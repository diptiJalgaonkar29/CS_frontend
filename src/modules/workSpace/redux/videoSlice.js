import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  video: {},
  thumbnails: [],
  coverImage: "",
  videoNavigationTo: "",
  uploadedVideoURL: "",
  uploadedVideoBlobURL: "",
  tXStatus: null,
  tXsplit: null,
  tXfilePath: null,
  tXfilePathBlob: null,
  tXId: null,
};

const videoSlice = createSlice({
  name: "VIDEO",
  initialState,
  reducers: {
    SET_VIDEO_META: (state, action) => {
      let videoObj = action.payload;
      for (const key in videoObj) {
        if (Object.hasOwnProperty.call(videoObj, key)) {
          const element = videoObj[key];
          state[key] = element;
        }
      }
    },
    RESET_VIDEO_META: () => initialState,
  },
});

export default videoSlice.reducer;
export const { SET_VIDEO_META, RESET_VIDEO_META } = videoSlice.actions;
