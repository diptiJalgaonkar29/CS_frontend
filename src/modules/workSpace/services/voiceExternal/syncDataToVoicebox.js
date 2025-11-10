import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
// import getCSUserMeta from "../../../../utils/getCSUserMeta";

const syncDataToVoicebox = ({ data, onSuccess, onError }) => {
  const { status, id, ...restData } = data;
  // const { authMeta } = getCSUserMeta();
  var formdata = new FormData();
  formdata.append("status", status);
  formdata.append("id", id);
  // formdata.append(
  //   "Pronouncationuser",
  //   `${authMeta?.username}-${authMeta?.user_id}`
  // );
  formdata.append("data", JSON.stringify(restData));
  // console.log("formdata", formdata);
  axiosCSPrivateInstance
    .put("/dictionary/sync_to_voicebox", formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default syncDataToVoicebox;
