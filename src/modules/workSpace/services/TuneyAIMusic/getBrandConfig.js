import axiosTuneyCueInstance from "../../../../axios/axiosTuneyCueInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";

const getBrandConfig = ({ brand, onSuccess, onError }) => {
  axiosTuneyCueInstance
    .get(`brand_tags/${brand}/configs`)
    .then(async (response) => {
      onSuccess?.(response);
    })
    .catch(function (error) {
      console.log("Error getBrandConfig ", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
    });
};

export default getBrandConfig;
