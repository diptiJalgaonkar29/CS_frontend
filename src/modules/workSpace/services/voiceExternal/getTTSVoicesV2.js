import axiosTTSPrivateInstanceV2 from "../../../../axios/axiosTTSPrivateInstanceV2";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { store } from "../../../../reduxToolkit/store";
import { SET_VOICE_META } from "../../redux/voicesSlice";
import getTTSDisabledVoicesV2 from "./getTTSDisabledVoicesV2";

async function fetchVoiceEnabledDisabledStatus() {
  const dispatch = store.dispatch;
  const selectedVoices = store.getState()?.voices?.selectedVoices || [];
  const allVoicesShortname = selectedVoices
    ?.flatMap((item) => item?.content)
    ?.map((item) => item?.voice);
  const uniqueShortnames = Array.isArray(allVoicesShortname)
    ? [...new Set(allVoicesShortname)]
    : [];
  console.log("uniqueShortnames", uniqueShortnames);
  let disabledVoices = [];
  if (uniqueShortnames?.length > 0) {
    const voicesStatus = await getTTSDisabledVoicesV2(
      uniqueShortnames.toString()
    );
    try {
      disabledVoices = voicesStatus
        ?.filter((data) => data?.statusId === 0)
        ?.map((data) => data.shortName);
      console.log("disabledVoices", disabledVoices);
    } catch (error) {}
  }
  dispatch(
    SET_VOICE_META({
      disabledVoices: disabledVoices,
    })
  );
}

const getTTSVoicesV2 = ({ onSuccess, onError }) => {
  fetchVoiceEnabledDisabledStatus();
  axiosTTSPrivateInstanceV2
    .post("/api/Voice/getvoiceartistlist")
    .then(async (res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getTTSVoicesV2;