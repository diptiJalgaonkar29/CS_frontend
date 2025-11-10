import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const getVideoProcessStatus = async ({ projectID }) => {
  try {
    const response = await axiosCSPrivateInstance.get(
      `/video/videoStatus/${projectID}`
    );
    return response?.data;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export default getVideoProcessStatus;
