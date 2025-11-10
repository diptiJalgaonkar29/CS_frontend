import React, { useState, useEffect, forwardRef } from "react";
import LineChart from "../../../../../common/components/ChartComponents/Type/LineChart";
import NoDataHorizontalBarChartPlaceholder from "../../../../../common/components/ChartComponents/NoDataHorizontalBarChartPlaceholder";
import {
  eachMonthOfInterval,
  format,
  getMonth,
  getYear,
  differenceInDays,
  eachDayOfInterval,
} from "date-fns";

const MonthWiseCount = ({ data, endDate, startDate }) => {
  const [labels, setLabels] = useState([]);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    if (!!data) {
      const diffDays = differenceInDays(endDate, startDate);
      const tempLabels = [];
      const tempCounts = [];

      if (diffDays <= 31) {
        const eachDayArr = eachDayOfInterval({
          start: startDate,
          end: endDate,
        });

        eachDayArr.forEach((currentDate) => {
          const formattedDate = format(currentDate, "d MMM");
          tempLabels.push(formattedDate);
          const currentDateISO = format(currentDate, "yyyy-MM-dd");
          const userDataForDate = data.find(
            (item) => item.day === currentDateISO
          );
          tempCounts.push(userDataForDate ? userDataForDate.count : "");
        });

        setLabels(tempLabels);
        setCounts(tempCounts);
      } else {
        let eachMonthOfIntervalArr = eachMonthOfInterval({
          start: startDate,
          end: endDate,
        });

        let dataMod = eachMonthOfIntervalArr.map((startMonthDate) => {
          let month = getMonth(startMonthDate) + 1;
          let year = getYear(startMonthDate);
          let countCheck = data?.reduce((sum, item) => {
            return item?.month === month && item?.year === year
              ? sum + item?.count
              : sum;
          }, 0);
          // console.log("countCheck", countCheck);
          let count = countCheck ? countCheck : 0;
          return {
            label: format(startMonthDate, "MMM yyyy"),
            count,
          };
        });
        setLabels(dataMod?.map((data) => data?.label));
        setCounts(dataMod?.map((data) => data?.count));
      }
    }
  }, [startDate, endDate]);

  return (
    <>
      {data?.length === 0 ? (
        <NoDataHorizontalBarChartPlaceholder placeholder={"No data found!"} />
      ) : (
        <div style={{ padding: "10px 0" }}>
          <LineChart labels={labels} values={counts} />
        </div>
      )}
    </>
  );
};

export default MonthWiseCount;
