import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const addAIMusicResponse = ({ responseMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/aiMusicGenrated/addAll", responseMeta)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      onError?.();
    });
};

export default addAIMusicResponse;
