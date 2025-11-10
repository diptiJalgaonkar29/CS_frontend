import axiosCSAdminPrivateInstance from "../../../../axios/axiosCSAdminPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getMonthWiseDetailsGeneratedReportMonthly = ({
  month,
  email,
  onSuccess,
  onError,
  brandId,
}) => {
  // console.log("brandId....", brandId);
  let encodeemail = btoa(email);

  // Build query parameters
  // let url = `/likedmusic/getAiMusicCreatedByMonth/${month}/${encodeemail}`;
  // if (brandId) {
  //   url += `?brandId=${brandId}`;
  // }

  const url = `/likedmusic/getAiMusicCreatedByMonth/${month}/${encodeemail}`;

  const params = {};
  if (brandId) params.brandId = brandId;

  axiosCSAdminPrivateInstance
    .get(url, { params })
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

export default getMonthWiseDetailsGeneratedReportMonthly;
