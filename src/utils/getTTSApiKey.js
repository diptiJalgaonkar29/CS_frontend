import axiosCSPrivateInstance from "../axios/axiosCSPrivateInstance";
//import getSuperBrandName from "./getSuperBrandName";

const getTTSApiKey = async () => {
  try {
    //let superBrandName = getSuperBrandName();
    //to add to fetch brandId

    //return process.env?.[`REACT_APP_API_TTS_API_KEY_${superBrandName.toUpperCase()}`];
    //to addreturn process.env?.[`REACT_APP_API_TTS_API_KEY_${brandId.toUpperCase()}`];
    const res = await axiosCSPrivateInstance.get("tts_utils/getTtsApiKey");
    // Return the key safely
    return res?.data?.ttsApiKey || null;
  } catch (error) {
    console.error("Error fetching TTS API Key:", error);
    return null;
  }
};

export default getTTSApiKey;
