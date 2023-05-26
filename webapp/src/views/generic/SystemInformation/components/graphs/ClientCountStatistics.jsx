import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { Line } from "react-chartjs-2";
import {
  dashboardPanelChart,
  datasetOptions,
  formDatasets,
} from "services/chart";
import { copyDeep } from "services/utils";
import Graph from "components/Graph/Graph.jsx";
import GraphCardHeader from "components/GraphCardHeader/GraphCardHeader";
import { getGraphData } from "services/devices";

export default function ClientCountStatistics(props) {
  const chartSettings = copyDeep(dashboardPanelChart);
  const { options } = chartSettings;

  const [state, setState] = useState({
    chartOptions: options,
    options: [],
    wsactive: false,
    step: 0,
    interval: "instant",
    initialList: ["avg_client_count", "avg_healthy_client_count"],
    list: ["clientCount", "healthyClients"],
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
          tooltipItem.yLabel.toFixed(2)
        );
      },
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
        case "clientCount":
        case "avg_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[0] });
          break;
        case "healthyClients":
        case "avg_healthy_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[1] });
          break;
        case "min_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[2] });
          break;
        case "min_healthy_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[3] });
          break;
        case "max_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[4] });
          break;
        case "max_healthy_client_count":
          chartDataColored.push({ ...realDataset, ...datasetOptions[5] });
          break;
      }
    });
    return chartDataColored;
  };

  const updateLabels = (datasets) => {
    datasets.forEach((dataset) => {
      switch (dataset.label) {
        case "clientCount":
        case "avg_client_count":
          dataset.label = "Total clients";
          break;
        case "healthyClients":
        case "avg_healthy_client_count":
          dataset.label = "Healthy clients";
          break;
        case "min_client_count":
          dataset.label = "Min total clients";
          break;
        case "min_healthy_client_count":
          dataset.label = "Min healthy clients";
          break;
        case "max_client_count":
          dataset.label = "Max total clients";
          break;
        case "max_healthy_client_count":
          dataset.label = "Max healthy clients";
          break;
      }
    });
  };

  const updateGraphFilling = (datasets) => {
    let isOnlyAvg = true;
    isOnlyAvg = !!datasets.find(
      (x) =>
        x.label !== "avg_client_count" && x.label !== "avg_healthy_client_count"
    );
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      if (
        dataset.order === 0 &&
        (dataset.label === "avg_client_count" ||
          dataset.label === "avg_healthy_client_count")
      )
        dataset.fill = isOnlyAvg ? false : true;
      if (
        dataset.order === 1 &&
        (dataset.label === "avg_client_count" ||
          dataset.label === "avg_healthy_client_count")
      )
        dataset.fill = isOnlyAvg ? false : true;
    }
  };

  const optionsTitle = {
    throughputRx: ["Total clients"],
    throughputTx: ["Healthy clients"],
  };

  const formGroupProps = {
    className: "vertical-align-middle ml-0",
  };

  const filterOptions = {
    throughputRx: [
      { value: "min_client_count", name: "MIN" },
      { value: "max_client_count", name: "MAX" },
      { value: "avg_client_count", name: "Average" },
    ],
    throughputTx: [
      { value: "min_healthy_client_count", name: "MIN" },
      { value: "max_healthy_client_count", name: "MAX" },
      { value: "avg_healthy_client_count", name: "Average" },
    ],
  };

  const handleIntervalChange = (event) => {
    const { name, value } = event.target;
    if (value === "instant") {
      setState({
        ...state,
        [name]: value,
        list: ["clientCount", "healthyClients"],
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
        list: ["clientCount", "healthyClients"],
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
      )}
    </>
  );
}
