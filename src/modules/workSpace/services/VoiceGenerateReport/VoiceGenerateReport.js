import axiosCSAdminPrivateInstance from "../../../../axios/axiosCSAdminPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { format, subMonths, subDays, addDays } from "date-fns";

const getVoiceGeneratedReportMonthly = ({
  startDate,
  endDate,
  selectedBrandId,
  onSuccess,
  onError,
}) => {
  function dateFormat(date) {
    var result = date;
    return format(result, "yyyy-MM-dd");
  }
  const formateEndDate = dateFormat(addDays(endDate, 1));
  const formatStartDate = dateFormat(startDate);
  console.log("selectedBrandId", selectedBrandId);

  let url = `/tts_utils/getReportdataForTTS?start=${formatStartDate}&end=${formateEndDate}`;
  if (selectedBrandId) {
    url += `&brandId=${selectedBrandId}`;
  }

  axiosCSAdminPrivateInstance
    .get(
      // `/tts_utils/getReportdataForTTS?start=${formatStartDate}&end=${formateEndDate}`
      url
    )
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

export default getVoiceGeneratedReportMonthly;
