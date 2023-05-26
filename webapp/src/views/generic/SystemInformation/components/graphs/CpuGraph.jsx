import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  dashboardPanelChart,
  datasetOptions,
  formDatasets,
} from "services/chart";
import { copyDeep } from "services/utils";
import Graph from "components/Graph/Graph.jsx";
import { getGraphData } from "services/devices";

export default function CpuLine(props) {
  const chartSettings = copyDeep(dashboardPanelChart);
  const { options } = chartSettings;
  let { scales } = options;
  scales.yAxes[0].ticks.min = 0;
  scales.yAxes[0].ticks.max = 100;
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
          Math.round(tooltipItem.yLabel) +
          "%"
        );
      },
    };
    scales.yAxes[0].ticks.callback = function (label) {
      return label + "%";
    };
  }, [props?.list, props?.interval, props?.device?.devicemac]);

  const returnChartData = (dataLabels, interval, data) => {
    let realChartData = formDatasets(dataLabels, interval, data);
    realChartData.datasets = chartDataColored(realChartData.datasets);
    updateLabels(realChartData.datasets);
    return realChartData;
  };

  const chartDataColored = (datasets) => {
    let chartDataColored = [];
    datasets.forEach((realDataset) => {
      chartDataColored.push({ ...realDataset, ...datasetOptions[0] });
    });
    return chartDataColored;
  };

  const updateLabels = (datasets) => {
    datasets.forEach((dataset) => {
      dataset.label = "CPU";
    });
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
