import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const CStoSSTransfer = ({ AITrackMeta, onSuccess, onError }) => {
  axiosCSPrivateInstance
    .post("/send_ss_track", AITrackMeta)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error while Creating Project", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default CStoSSTransfer;
