import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const addPronounciationTTSResponse = ({ responseMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/pronunciation/responseDataFromPronunciation", responseMeta)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      onError?.();
    });
};

export default addPronounciationTTSResponse;
