import React, { Component, useContext, useEffect, useState } from "react";
import "chartjs-plugin-piechart-outlabels";
import "chartjs-plugin-datalabels";
import ChartComponent from "react-chartjs-2";
import BrandingService from "../../../../branding/BrandingService";
import capitalizeFirstLetter from "../../../../utils/capitalizeFirstLetter";
import { useConfig } from "../../../../customHooks/useConfig";

const DonutChart = ({ labels, values }) => {
  const { theme } = useConfig();

  const colors = [
    theme["--color-donutchart-primary"],
    theme["--color-donutchart-secondary"],
    theme["--color-donutchart-tertiary"],
    theme["--color-donutchart-quaternary"],
    theme["--color-donutchart-quinary"],
    theme["--color-donutchart-senary"],
  ];
  console.log("colors", colors);
  let chartData = {
    labels: labels?.map((label) => label?.toLowerCase()),
    datasets: [
      {
        data: values,
        backgroundColor: [...colors, ...colors, ...colors],
      },
    ],
  };

  return (
    <div className="chart" style={{ padding: "25px 0" }}>
      <ChartComponent
        type="doughnut"
        data={chartData}
        options={{
          responsive: true,
          layout: {
            padding: 30,
          },
          tooltips: {
            enabled: true,
            callbacks: {
              title: () => "",
              label: function (tooltipItem, data) {
                let value = data?.datasets[0].data[tooltipItem.index];
                let sum = data?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0);
                let percentage = Math.round((value / sum) * 100);
                let percentageStr = percentage + "%";

                return (
                  capitalizeFirstLetter(data?.labels[tooltipItem.index]) +
                  " : " +
                  percentageStr
                );
              },
            },
          },
          elements: {
            arc: {
              borderWidth: 0.5,
            },
          },
          zoomOutPercentage: 30,
          legend: false,
          plugins: {
            datalabels: {
              formatter: (value, ctx) => {
                let datasets = ctx.chart.data.datasets;

                if (datasets.indexOf(ctx.dataset) === datasets?.length - 1) {
                  let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                  let percentage = Math.round((value / sum) * 100);
                  let percentageStr = percentage + "%";
                  if (percentage > 2) {
                    return percentageStr;
                  } else {
                    return "";
                  }
                }
              },
              color: "#000000",
              font: {
                size: 11,
              },
            },
            outlabels: {
              text: (label, percentage, value) => {
                return `${capitalizeFirstLetter(
                  label.labels[label.dataIndex]
                )}`;
              },

              color: theme["--color-white"],
              backgroundColor: "transparent",
              stretch: 10,
              lineColor: theme["--color-white"],
              lineWidth: 1.5,
              padding: -4,
              font: {
                family: "Roboto , Helvetica , Arial , sans-serif",
                size: 12,
                maxSize: 12,
                minSize: 12,
                resizable: true,
              },
            },
          },
        }}
      />
    </div>
  );
};
export default DonutChart;
