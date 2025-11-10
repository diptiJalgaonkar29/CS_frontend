import React from "react";
import DonutChart from "../../../../../common/components/ChartComponents/Type/DonutChart";
import NoDataHorizontalBarChartPlaceholder from "../../../../../common/components/ChartComponents/NoDataHorizontalBarChartPlaceholder";

export default function Top10Tempo({ data }) {
  const filteredUserData = data?.filter(
    (item) => item !== null || item !== undefined
  );
  const labels = filteredUserData?.map((item) => item?.tempo || item?.genre);
  const counts = filteredUserData?.map((item) => item?.count);
  // console.log(data, "moodData");

  if (data?.length === 0)
    return (
      <NoDataHorizontalBarChartPlaceholder placeholder={"No data found!"} />
    );

  return <DonutChart labels={labels} values={counts} />;
}
