import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authMeta: { username: "", fullName: "", id: 0, status: false },
  tuneyToken: "",
  CSToken: "",
  brandMeta: {},
  appAccess: {
    AI_MUSIC: false,
    AI_VOICE: false,
    SS_ACCESS: false,
    AI_MUSIC_CREATE: false,
    AI_MUSIC_EDIT: false,
    AI_MUSIC_VARIANT: false,
  },
  authAction: "",
  isReportPasswordValid: false,
};

const authSlice = createSlice({
  name: "AUTH",
  initialState,
  reducers: {
    SET_AUTH_STATE: (state, action) => {
      state.auth = action.payload;
      state.authAction = "LOGIN";
    },
    REMOVE_AUTH_STATE: () => {
      localStorage.clear();
      return initialState;
    },
    SET_AUTH_META: (state, action) => {
      let authObj = action.payload;
      for (const key in authObj) {
        if (Object.hasOwnProperty.call(authObj, key)) {
          const element = authObj[key];
          state[key] = element;
        }
      }
    },
  },
});

export default authSlice.reducer;
export const { SET_AUTH_STATE, REMOVE_AUTH_STATE, SET_AUTH_META } =
  authSlice.actions;
