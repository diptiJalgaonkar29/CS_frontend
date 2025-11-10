import axiosCSAdminPrivateInstance from "../../../../axios/axiosCSAdminPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getLikeDislikeCueIdReport = ({ onSuccess, onError, selectedBrandId }) => {
  console.log("selectedBrandId", selectedBrandId);

  let url = `/likedmusic/getAllData`;
  if (selectedBrandId) {
    url += `?brandId=${selectedBrandId}`;
  }

  axiosCSAdminPrivateInstance
    .get(url)
    .then((res) => {
      onSuccess?.(res);
    })
    .catch((err) => {
      console.log("Error", err);
      if (err?.response?.status !== 401) {
        showNotification("ERROR", "Something went wrong!");
      }
      onError?.(err);
    });
};

export default getLikeDislikeCueIdReport;
