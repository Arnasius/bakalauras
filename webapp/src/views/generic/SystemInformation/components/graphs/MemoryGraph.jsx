import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { bytesRange } from "services/text";
import {
  dashboardPanelChart,
  datasetOptions,
  formDatasets,
} from "services/chart";
import { copyDeep } from "services/utils";
import Graph from "components/Graph/Graph.jsx";
import { getGraphData } from "services/devices";

export default function MemoryLine(props) {
  const chartSettings = copyDeep(dashboardPanelChart);
  const { options } = chartSettings;
  const { scales } = options;
  const [state, setState] = useState({
    chartOptions: options,
    chartData: [],
  });

  useEffect(() => {
    if (props.device.devicemac)
      getGraphData(props.device.devicemac, props.interval, props.list.join(","))
        .then((data) => {
          setState({
            ...state,
            chartData: returnChartData(props.list, props.interval, data),
          });
        })
        .catch((err) => console.error(err));
    options.tooltips.callbacks = {
      label: function (tooltipItem, data) {
        return (
          data.datasets[tooltipItem.datasetIndex].label +
          ": " +
          bytesRange(Math.round(tooltipItem.yLabel * 100) / 100)
        );
      },
    };
    scales.yAxes[0].ticks.callback = function (label) {
      return bytesRange(Math.round(label));
    };
    scales.yAxes[0].ticks.max = props.memoryTotal;
  }, [props?.interval, props?.list, props?.device?.devicemac]);

  const returnChartData = (dataLabels, interval, data) => {
    let realChartData = formDatasets(dataLabels, interval, data);
    let memoryTotalData = [];
    for (let i = 0; i < realChartData.labels.length; i++) {
      memoryTotalData.push(props.memoryTotal);
    }
    realChartData.datasets.push({
      data: memoryTotalData,
      label: "Total memory",
    });
    realChartData.datasets = chartDataColored(realChartData.datasets);
    updateGraphFilling(realChartData.datasets);
    updateLabels(realChartData.datasets);
    return realChartData;
  };

  const chartDataColored = (datasets) => {
    let chartDataColored = [];
    datasets.forEach((realDataset) => {
      switch (realDataset.label) {
        case "memoryusage":
        case "avg_memory_usage":
          chartDataColored.push({ ...realDataset, ...datasetOptions[1] });
          break;
        case "min_memory_usage":
          chartDataColored.push({ ...realDataset, ...datasetOptions[3] });
          break;
        case "max_memory_usage":
          chartDataColored.push({ ...realDataset, ...datasetOptions[5] });
          break;
        case "Total memory":
          chartDataColored.push({ ...realDataset, ...datasetOptions[6] });
      }
    });
    return chartDataColored;
  };

  const updateLabels = (datasets) => {
    datasets.forEach((dataset) => {
      switch (dataset.label) {
        case "memoryusage":
        case "avg_memory_usage":
          dataset.label = "Used memory";
          break;
        case "min_memory_usage":
          dataset.label = "Min used memory";
          break;
        case "max_memory_usage":
          dataset.label = "Max used memory";
          break;
      }
    });
  };

  const updateGraphFilling = (datasets) => {
    let isOnlyAvg = true;
    isOnlyAvg = !!datasets.find(
      (x) => x.label !== "avg_memory_usage" && x.label !== "Total memory"
    );
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      if (dataset.label === "avg_memory_usage")
        dataset.fill = isOnlyAvg ? false : true;
    }
  };

  return (
    <>
      {state.chartData.datasets && (
        <Graph
          size="md"
          content={
            <Line
              data={state.chartData}
              options={state.chartOptions}
              redraw={true}
            />
          }
        />
      )}
    </>
  );
}
