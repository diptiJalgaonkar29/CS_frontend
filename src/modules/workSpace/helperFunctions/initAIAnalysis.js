import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";
import { store } from "../../../reduxToolkit/store";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import { SET_AI_MUSIC_BRAND_CONFIG_META } from "../redux/AIMusicbrandConfigsSlice";
import { SET_AI_MUSIC_META } from "../redux/AIMusicSlice";
import getBrandConfig from "../services/TuneyAIMusic/getBrandConfig";

const tempoRange = {
  slow: { min: 1, max: 92 },
  fast: { min: 93, max: 200 },
};

function mapTempoToBPM(tempo, tempoRange) {
  try {
    const bpm = tempoRange[tempo.toLowerCase()];
    if (bpm) {
      return `${bpm.min}-${bpm.max} BPM`;
    } else {
      return "1-92 BPM";
    }
  } catch (error) {
    return "1-92 BPM";
  }
}

export const initAIAnalysis = ({ data, onSuccess, onError, onFinally }) => {
  const dispatch = store.dispatch;
  const { AIMusicConfigByBrand } = store.getState()?.brandConfigs;
  const { brandMeta } = getCSUserMeta();

  const handleAIAnalysis = (configArray) => {
    const updatedData = {
      ...data,
      combinations: formatCombinations(configArray),
    };

    axiosCSPrivateInstance
      .post(`/ai_analysis/`, updatedData)
      .then((response) => {
        const respData = response.data;
        onSuccess?.(respData);
        console.log('respData', respData)
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorProgress: {
              id: respData.id,
              status: respData.status,
              mediatype: respData.mediatype,
            },
            aiMusicGenerator: {
              id: respData.id,
              status: respData.status,
              mediatype: respData.mediatype,
            },
          })
        );
      })
      .catch((error) => {
        console.error("Error in AI analysis request:", error);
        showNotification("ERROR", "Something went wrong!");
        onError?.();
      })
      .finally(() => {
        onFinally?.();
      });
  };

  if (!AIMusicConfigByBrand || AIMusicConfigByBrand.length === 0) {
    getBrandConfig({
      brand: brandMeta?.tuneyBrandName,
      onSuccess: (response) => {
        const configData = response?.data;
        if (!configData || configData.length === 0) return;
        dispatch(
          SET_AI_MUSIC_BRAND_CONFIG_META({ AIMusicConfigByBrand: configData })
        );
        handleAIAnalysis(configData);
      },
      onError: () => {
        showNotification("ERROR", "Failed to load brand config");
        onError?.();
        onFinally?.();
      },
    });
  } else {
    handleAIAnalysis(AIMusicConfigByBrand);
  }
};

const formatCombinations = (configArray) => {
  try {
    const combination = configArray?.map(({ genre, mood, tempo }) => [
      genre,
      mood,
      mapTempoToBPM(tempo, tempoRange),
    ]);
    return combination;
  } catch (error) {
    return [];
  }
};
