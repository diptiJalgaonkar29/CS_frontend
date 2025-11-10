import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const getFavVoicesList = async () => {
  let favData = [];
  try {
    favData = await axiosCSPrivateInstance.get(
      "/favourite/getByUserIdAndType?type=2"
    );
    return favData?.data?.FavList || [];
  } catch (error) {
    console.log("error", error);
    return favData;
  }
};

export default getFavVoicesList;
