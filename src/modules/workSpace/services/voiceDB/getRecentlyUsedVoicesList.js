import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const getRecentlyUsedVoicesList = async (limit = 10) => {
  let favData = [];
  try {
    favData = await axiosCSPrivateInstance.get(
      `/tts_utils/getRecentlyUsedVoicesByUser?limit=${limit}`
    );
    return favData?.data || [];
  } catch (error) {
    console.log("error", error);
    return favData;
  }
};

export default getRecentlyUsedVoicesList;
