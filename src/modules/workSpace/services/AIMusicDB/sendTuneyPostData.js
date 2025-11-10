import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const sendTuneyPostData = ({ requestObj, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/ai_analysis/add", requestObj)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      onError?.();
    });
};

export default sendTuneyPostData;
