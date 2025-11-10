import getTTSApiKey from "./getTTSApiKey";
import axiosTTSPublicInstanceV2 from "../axios/axiosTTSPublicInstanceV2";

const getTTSToken = async () => {
  try {
    let response = await axiosTTSPublicInstanceV2.get(
      `/api/Token?apiKey=${await getTTSApiKey()}`
    );
    let TTSToken = response.data?.accessToken;
    localStorage.setItem("TTSToken", TTSToken);
    return TTSToken;
  } catch (error) {
    return "";
  }
};

export default getTTSToken;
