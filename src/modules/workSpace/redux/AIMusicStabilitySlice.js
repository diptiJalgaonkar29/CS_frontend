import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stabilityLoading: false,
    latestFiledataStability: null,
    stabilityMP3TracksArr: [],
    currentUseThisTrack: [],
};

const AIMusicStabilitySlice = createSlice({
    name: "AI_MUSIC_Stability",
    initialState,
    reducers: {
        SET_AI_MUSIC_Stability_META: (state, action) => {
            console.log("AI_MUSIC_Stability action.payload", action.payload);
            state.stabilityLoading = action.payload?.stabilityLoading ?? false;
            state.latestFiledataStability = action.payload?.latestFiledataStability ?? null;
            state.stabilityMP3TracksArr = action.payload?.stabilityMP3TracksArr ?? [];
            state.currentUseThisTrack = action.payload?.currentUseThisTrack ?? [];
        },
        RESET_AI_Stability_MUSIC_META: () => initialState,
    },
});

export default AIMusicStabilitySlice.reducer;
export const {
    SET_AI_MUSIC_Stability_META,
    RESET_AI_Stability_MUSIC_META,
} = AIMusicStabilitySlice.actions;
