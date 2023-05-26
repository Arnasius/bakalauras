import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { Line } from "react-chartjs-2";
import { throughputRange } from "services/text";
import {
  dashboardPanelChart,
  datasetOptions,
  formDatasets,
} from "services/chart";
import { copyDeep } from "services/utils";
import Graph from "components/Graph/Graph.jsx";
import GraphCardHeader from "components/GraphCardHeader/GraphCardHeader";
import { getGraphData } from "services/devices";

export default function ThroughputStatistics(props) {
  const chartSettings = copyDeep(dashboardPanelChart);
  const { options } = chartSettings;
  const { scales } = options;

  const [state, setState] = useState({
    chartOptions: options,
    options: [],
    wsactive: false,
    step: 0,
    interval: "instant",
    initialList: ["avg_throughput_tx", "avg_throughput_rx"],
    list: ["throughputtx", "throughputrx"],
    isFullScreen: false,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (props.device.devicemac)
      getGraphData(props.device.devicemac, state.interval, state.list.join(","))
        .then((data) => {
          setChartData(returnChartData(state.list, state.interval, data));
        })
        .catch((err) => console.error(err));
  }, [state.interval, state.list, props.device?.devicemac]);

  useEffect(() => {
    options.tooltips.callbacks = {
      label: function (tooltipItem, data) {
        return (
          data.datasets[tooltipItem.datasetIndex].label +
          ": " +
          throughputRange(Math.round(tooltipItem.yLabel * 1e6))
        );
      },
    };
    scales.yAxes[0].ticks.callback = function (label) {
      return throughputRange(Math.round(label * 1e6));
    };
  });

  const returnChartData = (dataLabels, interval, data) => {
    let realChartData = formDatasets(dataLabels, interval, data);
    realChartData.datasets = chartDataColored(realChartData.datasets);
    updateGraphFilling(realChartData.datasets);
    updateLabels(realChartData.datasets);
    return realChartData;
  };

  const chartDataColored = (datasets) => {
    let chartDataColored = [];
    datasets.forEach((realDataset) => {
      switch (realDataset.label) {
        case "throughputrx":
        case "avg_throughput_rx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[0] });
          break;
        case "throughputtx":
        case "avg_throughput_tx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[1] });
          break;
        case "min_throughput_rx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[2] });
          break;
        case "min_throughput_tx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[3] });
          break;
        case "max_throughput_rx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[4] });
          break;
        case "max_throughput_tx":
          chartDataColored.push({ ...realDataset, ...datasetOptions[5] });
          break;
      }
    });
    return chartDataColored;
  };

  const updateLabels = (datasets) => {
    datasets.forEach((dataset) => {
      switch (dataset.label) {
        case "throughputrx":
        case "avg_throughput_rx":
          dataset.label = "Rx";
          break;
        case "throughputtx":
        case "avg_throughput_tx":
          dataset.label = "Tx";
          break;
        case "min_throughput_rx":
          dataset.label = "Min rx";
          break;
        case "min_throughput_tx":
          dataset.label = "Min tx";
          break;
        case "max_throughput_rx":
          dataset.label = "Max rx";
          break;
        case "max_throughput_tx":
          dataset.label = "Max tx";
          break;
      }
    });
  };

  const updateGraphFilling = (datasets) => {
    let isOnlyAvg = true;
    isOnlyAvg = !!datasets.find(
      (x) => x.label !== "avg_throughput_rx" && x.label !== "avg_throughput_tx"
    );
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      if (
        dataset.order === 0 &&
        (dataset.label === "avg_throughput_rx" ||
          dataset.label === "avg_throughput_tx")
      )
        dataset.fill = isOnlyAvg ? false : true;
      if (
        dataset.order === 1 &&
        (dataset.label === "avg_throughput_rx" ||
          dataset.label === "avg_throughput_tx")
      )
        dataset.fill = isOnlyAvg ? false : true;
    }
  };

  const optionsTitle = {
    throughputRx: ["Rx"],
    throughputTx: ["Tx"],
  };

  const formGroupProps = {
    className: "vertical-align-middle ml-0",
  };

  const filterOptions = {
    throughputRx: [
      { value: "min_throughput_rx", name: "MIN" },
      { value: "max_throughput_rx", name: "MAX" },
      { value: "avg_throughput_rx", name: "Average" },
    ],
    throughputTx: [
      { value: "min_throughput_tx", name: "MIN" },
      { value: "max_throughput_tx", name: "MAX" },
      { value: "avg_throughput_tx", name: "Average" },
    ],
  };

  const handleIntervalChange = (event) => {
    const { name, value } = event.target;
    if (value === "instant") {
      setState({
        ...state,
        [name]: value,
        list: ["throughputtx", "throughputrx"],
      });
    } else {
      setState({ ...state, [name]: value, list: state.initialList });
    }
  };

  const changeValues = (e, key, value) => {
    const { name, checked } = e.target;
    const selected = !checked ? value : name;
    if (selected === "instant") {
      setState({
        ...state,
        [key]: selected,
        list: ["throughputtx", "throughputrx"],
      });
    } else {
      setState({ ...state, [key]: selected, list: state.initialList });
    }
  };

  const changeOptions = (value, e) => {
    const { list } = state;
    const { name, checked } = e.target;
    let selected = [];
    selected = !checked
      ? list.filter((value) => value !== name)
      : [...list, value];
    setState({ ...state, list: selected, initialList: selected });
  };

  const toggleFullscreen = (value) => {
    setState({ ...state, isFullScreen: value });
  };

  return (
    <>
      {chartData.datasets && (
        <Row>
          <Col>
            <Card className={state.isFullScreen ? "fullscreen" : ""}>
              <CardHeader>
                <GraphCardHeader
                  id="network-throughput"
                  interval={state.interval}
                  formGroupProps={formGroupProps}
                  filtersComponentProps={{
                    list: state.list,
                    options: filterOptions,
                    optionsTitle: optionsTitle,
                    graphDataOptions: state.options,
                    changeOptions: changeOptions,
                    changeValues: changeValues,
                  }}
                  handleIntervalChange={handleIntervalChange}
                  isFullScreen={state.isFullScreen}
                  toggleFullscreen={toggleFullscreen}
                />
              </CardHeader>
              <CardBody>
                <Row>
                  <Col>
                    <Graph
                      size="md"
                      content={
                        <Line
                          data={chartData}
                          options={state.chartOptions}
                          redraw={true}
                        />
                      }
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
