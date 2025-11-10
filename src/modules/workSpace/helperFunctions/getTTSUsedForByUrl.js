const getTTSUsedForByUrl = (url) => {
  if (url?.startsWith("/api/Token?apiKey=")) {
    return "tts-token";
  } else if (url === "/api/Voice/getvoiceartistlist") {
    return "tts-voicesList";
  } else if (url === "/api/Voice/generatespeechAsync") {
    return "tts-process";
  } else if (url === "/api/Pronunciation/setpronunciation") {
    return "tts-setPronunciation";
  } else {
    return "tts";
  }
};

export default getTTSUsedForByUrl;
