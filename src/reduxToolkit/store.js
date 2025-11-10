import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import voicesReducer from "../modules/workSpace/redux/voicesSlice";
import voicesListReducer from "../modules/workSpace/redux/voicesListSlice";
import videoReducer from "../modules/workSpace/redux/videoSlice";
import projectMetaReducer from "../modules/workSpace/redux/projectMetaSlice";
import authStateReducer from "../modules/auth/redux/authSlice";
import dictionarySliceReducer from "../modules/workSpace/redux/dictionarySlice";
import AIMusicSliceReducer from "../modules/workSpace/redux/AIMusicSlice";
import AIMusicbrandConfigsReducer from "../modules/workSpace/redux/AIMusicbrandConfigsSlice";
import notificationReducer from "../common/redux/notificationSlice";
import notificationTopBarReducer from "../common/redux/notificationTopBarSlice";
import loaderReducer from "../common/redux/loaderSlice";
import tableReducer from "../modules/workSpace/redux/tableSlice";
import AITrackReportReducer from "../modules/workSpace/redux/AITrackSlice";
import profanityReducer from "../modules/workSpace/redux/profanitySlice";
import sonicLogoTrackReducer from "../modules/workSpace/redux/sonicLogoTrackSlice";
import reportReducer from "../common/redux/reportSlice";
import optionsReducer from "../common/redux/optionsSlice";
import statusSlice from "../modules/workSpace/redux/statusSlice";
import { encryptTransform } from "redux-persist-transform-encrypt";
import AIMusicStabilitySliceReducer from "../modules/workSpace/redux/AIMusicStabilitySlice";
import AITrackStabilitySliceReducer from "../modules/workSpace/redux/AITrackStabilitySlice";

const persistConfig = {
  key: "root",
  storage,
  // blacklist: [
  //   "voicesList",
  //   "notification",
  //   "loader",
  //   "dictionary",
  //   "brandConfigs",
  //   "table",
  //   "sonicLogoTrack",
  //   "report",
  // ],
  whitelist: [
    "voices",
    "video",
    "AIMusic",
    "projectMeta",
    "auth",
    "notificationTopBar",
    "profanity",
    "options",
    "AIMusicStability",
  ], // only these will be persisted
  transforms: [
    encryptTransform({
      secretKey:
        process.env.REACT_APP_REDUX_DATA_ENCRYPT_KEY || "my-super-secret-key",
      onError: function (error) {
        // console.log("encryptTransform :: ", error);
      },
    }),
  ],
};

const appReducer = combineReducers({
  voices: voicesReducer,
  video: videoReducer,
  AIMusic: AIMusicSliceReducer,
  projectMeta: projectMetaReducer,
  auth: authStateReducer,
  notificationTopBar: notificationTopBarReducer,
  profanity: profanityReducer,
  options: optionsReducer,
  voicesList: voicesListReducer,
  notification: notificationReducer,
  dictionary: dictionarySliceReducer,
  loader: loaderReducer,
  brandConfigs: AIMusicbrandConfigsReducer,
  table: tableReducer,
  AITrackReport: AITrackReportReducer,
  sonicLogoTrack: sonicLogoTrackReducer,
  report: reportReducer,
  status: statusSlice,
  AIMusicStability: AIMusicStabilitySliceReducer,
  AITrackStability: AITrackStabilitySliceReducer,
});

// Root reducer to handle the RESET action
const rootReducer = (state, action) => {
  if (action.type === "RESET") {
    // Clear the Redux state
    state = undefined;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // devTools: process.env.NODE_ENV !== "production",
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(thunk),
});

export const persistor = persistStore(store);
