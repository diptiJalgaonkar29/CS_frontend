import getCSUserMeta from "../../../utils/getCSUserMeta";
import trackExternalAPICalls from "../../../common/service/trackExternalAPICalls";
import axios from "axios";
import wordCapitalizer from "../../../utils/wordCapitalizer";
import { store } from "../../../reduxToolkit/store";
import getSuperBrandId from "../../../utils/getSuperBrandId";
import getConfigJson from "../../../utils/getConfigJson";

function getSubstring(str, char1, char2) {
  return str.substring(str.indexOf(char1), str.lastIndexOf(char2) + 1);
}

let apiCallCount = 0;
const MAX_CHAT_GPT_API_CALLS_COUNT = 3;
let OpenAPIKey = process.env.REACT_APP_OPEN_AI_API_KEY;

const callOpenAITogetVariantsTrackNamesAndDescription = async ({
  Arr,
  trackNameDescriptionByOpenAI,
  previousVariantCount,
  brandMeta,
  IGNORE_WORD_LIST_FROM_TRACK_NAME,
}) => {
  try {
    if (apiCallCount >= MAX_CHAT_GPT_API_CALLS_COUNT) {
      apiCallCount = 0;
      console.log("too many api calls");
      const trackNames = new Array(Arr?.length).fill(null).map((_, i) => ({
        name: `Variant ${Arr?.length - i + +previousVariantCount}`,
        description: `This is an AI generated track containing the ${wordCapitalizer(
          brandMeta?.musicBankBrandName
        )} sonic DNA and can be used for all branding purposes`,
      }));
      return trackNames;
    }
    apiCallCount += 1;
    let body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Process the provided array and return the processed array of objects in JSON format with "name" and "description" properties. For the "name" property, create a three-word instrumental track name that suits the mood, genre, and tempo specified in each respective object. Ensure that the names are unique and suitable for each track. Additionally, for the "description" property, generate a unique 75-word description that complements the mood, genre, and tempo indicated in each object. Mention that the main melody used is from the brand ${
            brandMeta?.musicBankBrandName
          }. Generate unique set of name and description. Avoid using words from this array ${JSON.stringify(
            IGNORE_WORD_LIST_FROM_TRACK_NAME
          )}. Finally, remove any extra spaces from the array of objects. The array to be processed is as follows:${JSON.stringify(
            Arr
          )}`,
        },
      ],
    };
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OpenAPIKey}`,
        },
      }
    );

    const trackNamesStr = getSubstring(
      response?.data?.choices?.[0]?.message?.content
        ?.replace(/\s+/g, " ")
        .trim(),
      "[",
      "]"
    );
    const trackNamesResponse = JSON.parse(trackNamesStr);
    // console.log("trackNamesResponse", trackNamesResponse);
    apiCallCount = 0;
    trackExternalAPICalls({
      url: response?.request?.responseURL,
      requestData: JSON.stringify({
        musicBankBrandName: brandMeta?.musicBankBrandName,
        OpenAPIKey,
      }),
      serviceBy: "openAI",
      usedFor: "title & desc",
      statusCode: response?.status,
      statusMessage: response?.statusText,
    });
    return trackNamesResponse;
  } catch (err) {
    trackExternalAPICalls({
      url: err?.request?.responseURL,
      requestData: JSON.stringify({
        musicBankBrandName: brandMeta?.musicBankBrandName,
        OpenAPIKey,
      }),
      serviceBy: "openAI",
      usedFor: "title & desc",
      statusCode: err?.response?.status,
      statusMessage: err?.response?.data?.error?.message,
    });
    console.log("something went wrong with openai ", err);
    return await callOpenAITogetVariantsTrackNamesAndDescription({
      Arr,
      trackNameDescriptionByOpenAI,
      previousVariantCount,
      brandMeta,
      IGNORE_WORD_LIST_FROM_TRACK_NAME,
    });
  }
};

const callBackendTogetVariantsTrackNamesAndDescription = async ({
  Arr,
  trackNameDescriptionByOpenAI,
  previousVariantCount,
  brandMeta,
  IGNORE_WORD_LIST_FROM_TRACK_NAME,
}) => {
  const trackMeta = {
    combination: Arr,
  };

  try {
    let { brandMeta } = getCSUserMeta();
    const { MUSIC_BANK_DOMAIN } = getConfigJson();
    const { auth } = store.getState();
    const stringToEncode = `${
      auth?.authMeta?.username
    }#split#UniqueTrackName#split#${Date.now()}`;
    const encodedString = btoa(stringToEncode);
    const trackNamesResponse = await axios.post(
      `${
        process.env.NODE_ENV === "development"
          ? process.env.REACT_APP_DEV_SS_DOMAIN
          : MUSIC_BANK_DOMAIN
      }/api/Unique_Track_Name/brand_combination/${encodedString}`,
      trackMeta,
      {
        headers: {
          BrandName: getSuperBrandId(),
          "Content-Type": "application/json",
          BrandId: localStorage.getItem("brandId"),
        },
      }
    );
    trackExternalAPICalls({
      url: trackNamesResponse?.request?.responseURL,
      requestData: !!trackNamesResponse?.config?.data
        ? JSON.stringify(trackNamesResponse?.config?.data)
        : "",
      serviceBy: "openAI",
      usedFor: "title & desc",
      statusCode: trackNamesResponse?.status,
      statusMessage: trackNamesResponse?.statusText,
    });
    if (
      !!trackNamesResponse?.data &&
      Array.isArray(trackNamesResponse?.data) &&
      Arr?.length === trackNamesResponse?.data?.length &&
      trackNamesResponse?.data?.every((data) => !data?.status)
    ) {
      return trackNamesResponse?.data;
    } else {
      console.log(
        "not getting proper response from backend Unique_Track_Name api"
      );
      return await callOpenAITogetVariantsTrackNamesAndDescription({
        Arr,
        trackNameDescriptionByOpenAI,
        previousVariantCount,
        brandMeta,
        IGNORE_WORD_LIST_FROM_TRACK_NAME,
      });
    }
  } catch (error) {
    console.log("Error : Unique_Track_Name api :: ", error);
    trackExternalAPICalls({
      url: error?.request?.responseURL,
      requestData: !!error?.config?.data
        ? JSON.stringify(error?.config?.data)
        : "",
      serviceBy: "sonic hub",
      usedFor: "title & desc",
      statusCode: error?.response?.status,
      statusMessage: error?.response?.data?.error?.message,
    });
    // try to get trackname and trackdesc from chatgpt from frontend
    return await callOpenAITogetVariantsTrackNamesAndDescription({
      Arr,
      trackNameDescriptionByOpenAI,
      previousVariantCount,
      brandMeta,
      IGNORE_WORD_LIST_FROM_TRACK_NAME,
    });
  }
};

const callStaticFunctionTogetVariantsTrackNamesAndDescription = ({
  Arr,
  previousVariantCount,
  brandMeta,
}) => {
  const trackNames = new Array(Arr?.length).fill(null).map((_, i) => ({
    name: `Variant ${Arr?.length - i + +(previousVariantCount || 0)}`,
    description: `This is an AI generated track containing the ${wordCapitalizer(
      brandMeta?.musicBankBrandName
    )} sonic DNA and can be used for all branding purposes`,
  }));
  return trackNames;
};

const getVariantsTrackNamesAndDescription = async (
  Arr,
  trackNameDescriptionByOpenAI,
  previousVariantCount
) => {
  let { brandMeta } = getCSUserMeta();
  const { IGNORE_WORD_LIST_FROM_TRACK_NAME = [] } = getConfigJson();
  // console.log("getVariantsTrackNamesAndDescription : config", {
  //   Arr,
  //   musicBankBrandName: brandMeta?.musicBankBrandName,
  //   IGNORE_WORD_LIST_FROM_TRACK_NAME,
  //   trackNameDescriptionByOpenAI,
  // });
  if (!trackNameDescriptionByOpenAI) {
    // try to get trackname and trackdesc from static string
    return callStaticFunctionTogetVariantsTrackNamesAndDescription({
      Arr,
      previousVariantCount,
      brandMeta,
    });
  } else {
    // try to get trackname and trackdesc from chatgpt from backend
    return await callBackendTogetVariantsTrackNamesAndDescription({
      Arr,
      trackNameDescriptionByOpenAI,
      previousVariantCount,
      brandMeta,
      IGNORE_WORD_LIST_FROM_TRACK_NAME,
    });
  }
};

export default getVariantsTrackNamesAndDescription;
