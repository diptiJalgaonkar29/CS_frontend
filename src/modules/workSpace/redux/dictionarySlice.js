import { createSlice, current } from "@reduxjs/toolkit";
import { KEY_REF } from "../constants/getTTSRefKeys";

const initialState = {
  dictData: [],
  dictFilteredVoiceList: [],
  insertDictData: {
    original_word: "",
    original_word_url: "",
    formatted_word: "",
    formatted_word_url: "",
    language: "",
    accent: "",
    voice: "",
  },
};

const dictionarySlice = createSlice({
  name: "DICTIONARY",
  initialState,
  reducers: {
    SET_DICT_DATA: (state, action) => {
      state.dictData = action.payload;
    },

    UPDATE_DICT_DATA: (state, action) => {
      const seletedDictRow = state.dictData.find(
        (data) => +data.id === +action.payload.id.split("-")[1]
      );
      if (seletedDictRow) {
        seletedDictRow[action.payload.id.split("-")[0]] = action.payload.value;
        if (action.payload.id.split("-")[0] === "language") {
          seletedDictRow.accent = null;
          seletedDictRow.voice = null;
          seletedDictRow.original_word_url = "";
          seletedDictRow.formatted_word_url = "";
        }
        if (action.payload.id.split("-")[0] === "accent") {
          seletedDictRow.voice = null;
          seletedDictRow.original_word_url = "";
          seletedDictRow.formatted_word_url = "";
        }
        if (action.payload.id.split("-")[0] === "voice") {
          seletedDictRow.original_word_url = "";
          seletedDictRow.formatted_word_url = "";
        }
        if (
          action.payload.id.split("-")[0] === "original_word" ||
          action.payload.id.split("-")[0] === "formatted_word"
        ) {
          let key = `${action.payload.id.split("-")[0]}_url`;
          seletedDictRow[key] = "";
        }
      }
    },
    DELETE_DICT_DATA: (state, action) => {
      const seletedDictRowIndex = state.dictData.findIndex(
        (data) => +data.id === +action.payload
      );
      if (seletedDictRowIndex !== -1) {
        state.dictData.splice(seletedDictRowIndex, 1);
      }
    },
    SET_INSERT_DICT_DATA: (state, action) => {
      state.insertDictData = action.payload;
    },
    RESET_INSERT_DICT_DATA: (state, action) => {
      state.insertDictData = initialState.insertDictData;
    },
    UPDATE_INSERT_DICT_DATA: (state, action) => {
      state.insertDictData[action.payload.id] = action.payload.value;
      if (action.payload.id === "language") {
        state.insertDictData.accent = null;
        state.insertDictData.voice = null;
        state.insertDictData.original_word_url = "";
        state.insertDictData.formatted_word_url = "";
      }
      if (action.payload.id === "accent") {
        state.insertDictData.voice = null;
        state.insertDictData.original_word_url = "";
        state.insertDictData.formatted_word_url = "";
      }
      if (action.payload.id === "voice") {
        state.insertDictData.original_word_url = "";
        state.insertDictData.formatted_word_url = "";
      }
      if (
        action.payload.id === "original_word" ||
        action.payload.id === "formatted_word"
      ) {
        let key = `${action.payload.id}_url`;
        state.insertDictData[key] = "";
      }
    },
    SET_DICT_META: (state, action) => {
      let dictMetaObj = action.payload;
      for (const key in dictMetaObj) {
        if (Object.hasOwnProperty.call(dictMetaObj, key)) {
          const element = dictMetaObj[key];
          state[key] = element;
        }
      }
    },
    RESET_DICT_META: () => initialState,
  },
});

export default dictionarySlice.reducer;
export const {
  SET_DICT_META,
  SET_DICT_DATA,
  UPDATE_DICT_DATA,
  DELETE_DICT_DATA,
  SET_INSERT_DICT_DATA,
  RESET_INSERT_DICT_DATA,
  UPDATE_INSERT_DICT_DATA,
  RESET_DICT_META,
} = dictionarySlice.actions;
