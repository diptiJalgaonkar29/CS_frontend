import { store } from "../reduxToolkit/store";

export const checkSSAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.SS_ACCESS;
};

export const checkAIMusicAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.AI_MUSIC;
};

export const checkAIVoiceAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.AI_VOICE;
};

export const checkAIMusicCreateAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.AI_MUSIC && appAccess?.AI_MUSIC_CREATE;
};

export const checkAIMusicEditAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.AI_MUSIC && appAccess?.AI_MUSIC_EDIT;
};

export const checkAIMusicVariantAccess = () => {
  const { appAccess } = store.getState()?.auth;
  return appAccess?.AI_MUSIC && appAccess?.AI_MUSIC_VARIANT;
};
