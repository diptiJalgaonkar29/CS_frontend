import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: {}, // { [projectId]: { status, progress } }
  activeProjectIds: [],
  error: null,
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setProjectStatus: (state, action) => {
      const { projectId, status, progress } = action.payload || {};

      if (
        !projectId ||
        typeof status === "undefined" ||
        typeof progress === "undefined"
      ) {
        console.warn("Invalid payload for setProjectStatus:", action.payload);
        return;
      }

      state.projects[projectId] = { status, progress };

      if (!state.activeProjectIds.includes(projectId)) {
        state.activeProjectIds.push(projectId);
      }

      if (status === "completed" || status === "failed") {
        state.activeProjectIds = state.activeProjectIds.filter(
          (id) => id !== projectId
        );
      }
    },

    addActiveProjectId: (state, action) => {
      const projectId = action.payload;
      if (!projectId) {
        console.warn(
          "Invalid projectId for addActiveProjectId:",
          action.payload
        );
        return;
      }

      if (!state.activeProjectIds.includes(projectId)) {
        state.activeProjectIds.push(projectId);
      }
    },

    setError: (state, action) => {
      const error = action.payload;
      state.error = error || "Unknown error";
    },
  },
});

export const { setProjectStatus, addActiveProjectId, setError } =
  statusSlice.actions;
export default statusSlice.reducer;
