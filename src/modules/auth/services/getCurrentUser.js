import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";

const getCurrentUser = ({ onSuccess, onError }) => {
  axiosCSPrivateInstance
    .get(`/user/getUserData`)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(() => {
      onError?.();
    });
};

export default getCurrentUser;
