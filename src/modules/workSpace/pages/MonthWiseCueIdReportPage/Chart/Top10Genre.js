import React from "react";
import DonutChart from "../../../../../common/components/ChartComponents/Type/DonutChart";
import NoDataHorizontalBarChartPlaceholder from "../../../../../common/components/ChartComponents/NoDataHorizontalBarChartPlaceholder";

export default function Top10Genre({ data }) {
  const filteredUserData = data?.filter(
    (item) => item !== null || item !== undefined
  );
  const labels = filteredUserData?.map((item) => item?.genre);
  const counts = filteredUserData?.map((item) => item?.count);
  // console.log(data, "moodData");

  return (
    <div style={{ padding: "12px 0" }}>
      {data?.length === 0 ? (
        <NoDataHorizontalBarChartPlaceholder placeholder={"No data found!"} />
      ) : (
        <DonutChart labels={labels} values={counts} />
      )}
    </div>
  );
}
