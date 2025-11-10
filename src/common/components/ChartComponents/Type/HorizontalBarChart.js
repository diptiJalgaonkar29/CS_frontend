import React from "react";
import { HorizontalBar } from "react-chartjs-2";

export const options = {
  indexAxis: "y",
  elements: {
    bar: {
      borderWidth: 100,
    },
  },
  layout: {
    padding: {
      left: 35,
      right: 75,
      bottom: 0,
    },
  },
  responsive: true,
  plugins: {
    datalabels: {
      color: "#000",
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
        afterFit: function (scaleInstance) {
          // console.log("scaleInstance", scaleInstance);
          scaleInstance.width = 250; // sets the width to 100px
        },
        // categorySpacing: 1,
        // barPercentage: 0.8,
        // barThickness: 25,
        ticks: {
          mirror: true,
          padding: 250,
          beginAtZero: true,
          stepSize: 1,
          fontSize: 14,
          fontFamily: "Roboto , Helvetica , Arial , sans-serif",
        },
        gridLines: {
          color: "#F2F4F6",
        },
      },
    ],
    xAxes: [
      {
        ticks: {
          display: false,
          beginAtZero: true,

          fontSize: 12,
          fontFamily: "Roboto , Helvetica , Arial , sans-serif",
        },
        gridLines: {
          display: false,
          color: "#fff",
        },
      },
    ],
  },
};

const addEllipsisForLongLabel = (labels, maxChars) => {
  return labels?.map((label, index) =>
    label?.length > maxChars
      ? `${index + 1}. ${label.slice(0, maxChars)}...`
      : `${index + 1}. ${label}`
  );
};

export default function HorizontalBarChart({ labels, values }) {
  var style = getComputedStyle(document.body);
  var primCol = style.getPropertyValue("--color-primary");
  const data = {
    labels: addEllipsisForLongLabel(labels, 26),
    datasets: [
      {
        data: values,
        borderColor: primCol,
        backgroundColor: primCol,
      },
    ],
  };
  return (
    <div style={{ paddingBottom: "30px" }}>
      <HorizontalBar options={options} data={data} />
    </div>
  );
}
