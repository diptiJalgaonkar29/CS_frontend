import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const getPopularVoicesList = async () => {
  let popularVoices = [];
  try {
    popularVoices = await axiosCSPrivateInstance.get(
      "/tts_utils/GetTop5Voices"
    );
    return popularVoices?.data?.shortnames || [];
  } catch (error) {
    console.log("error", error);
    return popularVoices;
  }
};

export default getPopularVoicesList;
