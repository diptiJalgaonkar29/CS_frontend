import React from "react";
import DonutChart from "../../../../../common/components/ChartComponents/Type/DonutChart";
import NoDataHorizontalBarChartPlaceholder from "../../../../../common/components/ChartComponents/NoDataHorizontalBarChartPlaceholder";

export default function Top10Voice({ data }) {
  const filteredData = data?.filter((item) => item?.display_name !== null);

  const labels = filteredData?.map((item) => item?.display_name);
  const counts = filteredData?.map((item) => item?.count);

  if (data?.length === 0)
    return (
      <NoDataHorizontalBarChartPlaceholder placeholder={"No data found!"} />
    );

  return <DonutChart labels={labels} values={counts} />;
}
