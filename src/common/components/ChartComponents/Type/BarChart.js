import React from "react";
import { Bar } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import getMonthName from "../../../../utils/getMonthName";

export default function BarChart({ labels, values }) {
  var style = getComputedStyle(document.body);
  var primCol = style.getPropertyValue("--color-primary");
  var dataLabelsColor = style.getPropertyValue("--color-white");
  var dataGridLinesColor = style.getPropertyValue("--color-secondary-shade3");
  let labelMonth = getMonthName(labels);
  // console.log("labelMonth", labelMonth, "label", labels);
  const options = {
    responsive: true,
    layout: {
      padding: 25,
    },
    plugins: {
      datalabels: {
        color: dataLabelsColor,
        align: "end",
        anchor: "end",
        font: {
          weight: "bold",
          size: 12,
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
            // stepSize: 2,
            autoSkip: true,
            maxTicksLimit: 8,
            fontSize: 12,
            fontFamily: "Roboto , Helvetica , Arial , sans-serif",
          },
          gridLines: {
            color: "transparent",
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            fontSize: 12,
            fontFamily: "Roboto , Helvetica , Arial , sans-serif",
          },
          gridLines: {
            color: "transparent",
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
        backgroundColor: primCol,
      },
    ],
  };
  return <Bar options={options} data={data} />;
}
