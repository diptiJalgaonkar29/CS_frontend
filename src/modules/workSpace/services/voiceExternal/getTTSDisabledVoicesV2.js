import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";

const getTTSDisabledVoicesV2 = async (shortName) => {
  try {
    const response = await axiosTTSPrivateInstanceV2.post(
      "/api/Voice/getselectedvoicestatusartistlist",
      { shortName }
    );
    return response?.data?.voiceData || [];
  } catch (error) {
    console.log("Error : ", error);
    return [];
  }
};

export default getTTSDisabledVoicesV2;
