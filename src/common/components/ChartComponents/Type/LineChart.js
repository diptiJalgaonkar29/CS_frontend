import React from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-datalabels";

export default function LineChart({ labels, values }) {
  var style = getComputedStyle(document.body);
  var primCol = style.getPropertyValue("--color-primary");
  var dataLabelsColor = style.getPropertyValue("--color-white");

  const options = {
    responsive: true,

    layout: {
      padding: {
        top: 20,
        left: 10,
        right: 10,
        bottom: 10,
      },
    },
    plugins: {
      datalabels: {
        color: dataLabelsColor,
        align: "end",
        anchor: "end",
        font: {
          weight: "bold",
          size: 12,
          family: "Roboto , Helvetica , Arial , sans-serif",
        },
        offset: 0,
      },
    },
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            autoSkip: true,
            maxTicksLimit: 8,
            fontSize: 12,
            fontFamily: "Roboto , Helvetica , Arial , sans-serif",
          },
          gridLines: {
            color: "transperant",
          },
        },
      ],
      xAxes: [
        {
          // gridLines: {
          //   color: "#F2F4F6",
          // },
          grid: {
            display: true,
            color: "transperant",
          },
          ticks: {
            stepSize: 50,
            fontSize: 12,
            fontFamily: "Roboto , Helvetica , Arial , sans-serif",
          },
        },
      ],
    },
  };
  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: primCol,
        backgroundColor: "transparent",
        lineTension: 0,
      },
    ],
  };
  return <Line options={options} data={data} id="line_chart" />;
}
