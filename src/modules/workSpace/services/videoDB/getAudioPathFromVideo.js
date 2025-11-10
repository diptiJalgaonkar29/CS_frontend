import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const getAudioPathFromVideo = async ({ taxonomyId }) => {
  try {
    const response = await axiosCSPrivateInstance.get(
      `/video/taxonomy_status/${taxonomyId}`
    );
    return response?.data;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export default getAudioPathFromVideo;
