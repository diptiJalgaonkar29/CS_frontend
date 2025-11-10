import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stabilityArr: [],
    currentUseThisTrack: [],
};

const AITrackStabilitySlice = createSlice({
    name: "AI_Track_Stability",
    initialState,
    reducers: {
        SET_AI_Track_Stability_META: (state, action) => {
            console.log("action.payload", action.payload);
            state.stabilityArr = action.payload?.stabilityArr ?? [];
            state.currentUseThisTrack = action.payload?.currentUseThisTrack ?? [];
        },
        RESET_AI_Stability_Track_META: () => initialState,
    },
});

export default AITrackStabilitySlice.reducer;
export const {
    SET_AI_Track_Stability_META,
    RESET_AI_Stability_Track_META,
} = AITrackStabilitySlice.actions;
