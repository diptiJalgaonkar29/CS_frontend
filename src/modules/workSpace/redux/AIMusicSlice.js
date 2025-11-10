import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isEditInstrumentBlockOpen: false,
  trackDuration: 0,
  isDrop: false,
  isDropSliderVisible: false,
  dropPosition: 0,
  stemVolume: {},
  endingOption: null,
  flaxTrackID: null,
  SSflaxTrackID: null,
  cueID: null,
  sonicLogoId: null,
  playedCueID: null,
  playedInstrument: null,
  playedSonicLogo: null,
  selectedAIMusicDetails: {},
  selectedAIMusicConfig: {},
  recentAIGeneratedData: [],
  avoidLengthRegeneration: false,
  previousCueID: null,
  redoCueID: null,
  isFreshAITracksListPage: false,
  freshAITracksVariantsList: null,
  AITrackVariations: null,
  likedAIMusicArr: [],
  dislikedAIMusicArr: [],
  regenerateLengthAPICallCount: 0,
  aiMusicGeneratorOption: "",
  aiMusicGenerator: null,
  aiMusicGeneratorProgress: null,
  aiMusicGeneratorTrackDetails: [],
  aiMusicGeneratorAnalysisDetails: [],
  playedSSTrack: null,
  randomTrackSuffleloader: true,
  allAiMusicTrackDetails: [],
};

const AIMusicSlice = createSlice({
  name: "AI_MUSIC",
  initialState,
  reducers: {
    SET_IS_EDIT_INSTRUMENT_BLOCK_OPEN: (state, action) => {
      state.isEditInstrumentBlockOpen = action.payload;
    },
    SET_AI_MUSIC_META: (state, action) => {
      let AIMusicObj = action.payload;
      for (const key in AIMusicObj) {
        if (Object.hasOwnProperty.call(AIMusicObj, key)) {
          const element = AIMusicObj[key];
          state[key] = element;
        }
      }
    },
    HANDLE_LIKE_DISLIKE_AI_MUSIC: (state, action) => {
      if (+action.payload?.status === 0) {
        state.dislikedAIMusicArr.push(action.payload?.cueId);
        state.likedAIMusicArr = state.likedAIMusicArr.filter(
          (cueID) => cueID !== action.payload?.cueId
        );
      } else if (+action.payload?.status === 1) {
        state.likedAIMusicArr.push(action.payload?.cueId);
        state.dislikedAIMusicArr = state.dislikedAIMusicArr.filter(
          (cueID) => cueID !== action.payload?.cueId
        );
      } else if (+action.payload?.status === 2) {
        state.likedAIMusicArr = state.likedAIMusicArr.filter(
          (cueID) => cueID !== action.payload?.cueId
        );
        state.dislikedAIMusicArr = state.dislikedAIMusicArr.filter(
          (cueID) => cueID !== action.payload?.cueId
        );
      }
    },
    RESET_AI_MUSIC_META: () => initialState,
  },
});

export default AIMusicSlice.reducer;
export const {
  SET_IS_EDIT_INSTRUMENT_BLOCK_OPEN,
  SET_AI_MUSIC_META,
  RESET_AI_MUSIC_META,
  HANDLE_LIKE_DISLIKE_AI_MUSIC,
} = AIMusicSlice.actions;
