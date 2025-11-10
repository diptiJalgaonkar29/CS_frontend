import axiosTTSPrivateInstance from "../../../../axios/axiosTTSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { v4 as uuidv4 } from "uuid";
import trackExternalAPICalls from "../../../../common/service/trackExternalAPICalls";
import { store } from "../../../../reduxToolkit/store";
import { SET_VOICE_META } from "../../redux/voicesSlice";

const processTTS = ({
  jobRequest,
  onSuccess,
  onError,
  onFinally,
  type = "SINGE_TTS",
}) => {
  let dispatch = store.dispatch;
  dispatch(
    SET_VOICE_META({
      isTTSProcessing: true,
    })
  );
  let contentJSON = jobRequest.map((data) => {
    return {
      content: data?.content,
      voice: data?.voice,
      speed: data?.speed,
    };
  });

  const newJobRequest = (type === "SINGE_TTS" ? contentJSON : jobRequest) || [];

  axiosTTSPrivateInstance
    .post("/api/musicbank/cs/process_TTS", {
      job_request: newJobRequest?.filter((data) => !!data?.content),
      key: process.env.REACT_APP_API_TTS_TOKEN,
      script_id: "musicbank-testCS-" + uuidv4(),
      musicbank_api: "",
    })
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    })
    .finally(() => {
      dispatch(
        SET_VOICE_META({
          isTTSProcessing: false,
        })
      );
      onFinally?.();
    });
};

export default processTTS;
