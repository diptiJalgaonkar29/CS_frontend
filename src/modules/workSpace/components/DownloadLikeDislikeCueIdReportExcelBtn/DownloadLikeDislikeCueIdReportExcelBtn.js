import React from "react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import _ from "lodash";
import showNotification from "../../../../common/helperFunctions/showNotification";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import formatDate from "../../../../utils/formatDate";

const getJSONDataForExcel = (JSONdata) => {
  let updatedJSONData = JSONdata?.map((data, index) => ({
    "Sr. No": index + 1,
    "Tuney Cue Id": data?.cue_id || "——",
    Note: data?.comment || "",
    Genre: data?.genre || "——",
    Mood: data?.mood || "——",
    Tempo: data?.tempo || "——",
    "Full Name": data?.full_name || "——",
    Email: data?.email || "——",
    Project: data?.project_name || "——",
    "Updated On":
      data?.changetimestamp || data?.newtimestamp
        ? formatDate(data?.changetimestamp || data?.newtimestamp)
        : "——",
    Status: data?.status || "——",
  }));
  return updatedJSONData;
};

const DownloadLikeDislikeCueIdReportExcelBtn = ({ data }) => {
  const { taskDetailTableSort } = useSelector((state) => state.table);

  const downloadExcel = (data) => {
    try {
      let sortedData =
        _.orderBy(
          data,
          taskDetailTableSort?.field,
          taskDetailTableSort?.order
        ) || [];
      let updatedJSONData = getJSONDataForExcel(sortedData);
      const worksheet = XLSX.utils.json_to_sheet(updatedJSONData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const filename = `Report-${new Date().toJSON()}.xlsx`.replace(/ /g, "_");
      XLSX.writeFile(workbook, filename);
      showNotification("SUCCESS", "Report Downloaded Successfully!");
    } catch (error) {
      showNotification("ERROR", "Something went wrong! Please try again.");
    }
  };

  return (
    <ButtonWrapper variant="filled" onClick={() => downloadExcel(data)}>
      Download
    </ButtonWrapper>
  );
};

export default DownloadLikeDislikeCueIdReportExcelBtn;
