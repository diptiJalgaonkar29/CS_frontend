import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    option: "",  // Default value
    video: false,      // Default value
};

const optionsSlice = createSlice({
    name: "options",
    initialState,
    reducers: {
        setOption: (state, action) => {
            console.log('action', action.payload)
            state.option = action.payload;
        },
        setVideo: (state, action) => {
            state.video = action.payload;
        }
    }
});

export const { setOption, setVideo } = optionsSlice.actions;
export default optionsSlice.reducer;
