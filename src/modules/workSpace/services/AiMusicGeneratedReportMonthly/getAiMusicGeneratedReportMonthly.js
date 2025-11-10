import axiosCSAdminPrivateInstance from "../../../../axios/axiosCSAdminPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { format, subMonths, subDays, addDays } from "date-fns";

function dateFormat(date) {
  var result = date;
  return format(result, "yyyy-MM-dd");
}

export const getAiMusicGeneratedReportMonthly = ({
  startDate,
  endDate,
  selectedBrandId,
  onSuccess,
  onError,
}) => {
  const formateEndDate = dateFormat(addDays(endDate, 1));
  const formatStartDate = dateFormat(startDate);

  // Build query parameters
  let url = `/likedmusic/getAiMusicGeneratedReportMonthly?start=${formatStartDate}&end=${formateEndDate}`;
  if (selectedBrandId) {
    url += `&brandId=${selectedBrandId}`;
  }

  axiosCSAdminPrivateInstance
    .get(
      // `/likedmusic/getAiMusicGeneratedReportMonthly?start=${formatStartDate}&end=${formateEndDate}&brandId=${selectedBrandId}` // Assuming selectedBrandId is a query parameter
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

export const getAITrackingData = ({
  startDate,
  endDate,
  selectedBrandId,
  onSuccess,
  onError,
}) => {
  const formateEndDate = dateFormat(addDays(endDate, 1));
  const formatStartDate = dateFormat(startDate);

  // Build query parameters
  let url = `/aiMusicGenrated/getAllAiMusicDataBydate?start=${formatStartDate}&end=${formateEndDate}`;
  if (selectedBrandId) {
    url += `&brandId=${selectedBrandId}`;
  }

  axiosCSAdminPrivateInstance
    .get(
      // `/aiMusicGenrated/getAllAiMusicDataBydate?start=${formatStartDate}&end=${formateEndDate}&brandId=${selectedBrandId}` // Assuming selectedBrandId is a query parameter
      url
    )
    .then((res) => {
      if (!res.data) return "Data not found";
      console.log(res.data, "dataUserTrack");

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
