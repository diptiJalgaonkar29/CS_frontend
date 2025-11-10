import React, { forwardRef } from "react";
import DonutChart from "../../../../../common/components/ChartComponents/Type/DonutChart";
import NoDataHorizontalBarChartPlaceholder from "../../../../../common/components/ChartComponents/NoDataHorizontalBarChartPlaceholder";
import { DataArrayTwoTone } from "@mui/icons-material";

const Top10Tags = ({ data }) => {
  const filteredUserData = data?.filter(
    (item) => item !== null && item !== undefined
  );
  const labels = filteredUserData?.map((item) => item?.mood);
  const counts = filteredUserData?.map((item) => item?.count);
  // console.log(data, "moodData");

  if (data?.length === 0)
    return (
      <div style={{ padding: "12px 0" }}>
        <NoDataHorizontalBarChartPlaceholder placeholder={"No data found!"} />
      </div>
    );

  return (
    <div>
      <DonutChart labels={labels} values={counts} />
    </div>
  );
};

export default Top10Tags;
