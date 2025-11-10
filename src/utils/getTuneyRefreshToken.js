import axios from "axios";
import trackExternalAPICalls from "../common/service/trackExternalAPICalls";

const getTuneyRefreshToken = async () => {
  var config = {
    method: "POST",
    url:
      process.env.REACT_APP_API_TUNEY_TOKEN_URL +
      process.env.REACT_APP_API_TUNEY_APIKEY,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: process.env.REACT_APP_API_TUNEY_API_REFRESH_TOKEN,
    }),
  };
  try {
    let response = await axios(config);
    trackExternalAPICalls({
      url: (response?.config?.baseURL || "") + response?.config?.url,
      requestData: !!response?.config?.data
        ? JSON.stringify(response?.config?.data)
        : "",
      serviceBy: "tuney",
      usedFor: "tuney-token",
      statusCode: response?.status,
      statusMessage: response?.statusText,
    });
    let tuneyToken = response.data?.access_token;
    localStorage.setItem("tuneyToken", tuneyToken);
    return tuneyToken;
  } catch (error) {
    trackExternalAPICalls({
      url: (error?.config?.baseURL || "") + error?.config?.url,
      requestData: !!error?.config?.data
        ? JSON.stringify(error?.config?.data)
        : "",
      serviceBy: "tuney",
      usedFor: "tuney-token",
      statusCode: error?.response?.status,
      statusMessage: error?.message,
    });
    return "";
  }
};

export default getTuneyRefreshToken;
