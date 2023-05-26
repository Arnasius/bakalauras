import React, { useState } from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import GraphCardHeader from "components/GraphCardHeader/GraphCardHeader";
import CpuGraph from "./CpuGraph";
import MemoryGraph from "./MemoryGraph";

export default function CpuMemoryStatistics(props) {
  const [state, setState] = useState({
    interval: "instant",
    listMemory: ["avg_memory_usage"],
    list: ["cpuusage"],
    isFullScreen: false,
    showGraph: "cpu",
    filterOptions: {},
  });

  const optionsTitle = {
    cpu: ["CPU"],
    memory: ["Memory"],
  };

  const memoryOptions = [
    { value: "min_memory_usage", name: "MIN" },
    { value: "max_memory_usage", name: "MAX" },
    { value: "avg_memory_usage", name: "Average" },
  ];

  const formGroupProps = {
    className: "vertical-align-middle ml-0",
  };

  const handleIntervalChange = (event) => {
    const { name, value } = event.target;
    if (state.showGraph === "cpu") {
      if (value === "instant") {
        setState({ ...state, [name]: value, list: ["cpuusage"] });
      } else {
        setState({ ...state, [name]: value, list: ["avg_cpu_usage"] });
      }
    } else {
      if (value === "instant") {
        setState({ ...state, [name]: value, list: ["memoryusage"] });
      } else {
        setState({ ...state, [name]: value, list: state.listMemory });
      }
    }
  };

  const changeValues = (e, key, value) => {
    const { name, checked } = e.target;
    const selected = !checked ? value : name;

    if (key === "interval" && selected === "instant") {
      if (state.showGraph === "cpu") {
        setState({ ...state, [key]: selected, list: ["cpuusage"] });
      } else {
        setState({ ...state, [key]: selected, list: ["memoryusage"] });
      }
    } else if (key === "interval" && selected !== "instant") {
      if (state.showGraph === "cpu") {
        setState({ ...state, [key]: selected, list: ["avg_cpu_usage"] });
      } else {
        setState({ ...state, [key]: selected, list: state.listMemory });
      }
    } else if (key === "showGraph" && selected === "cpu") {
      if (state.interval === "instant") {
        setState({
          ...state,
          showGraph: selected,
          list: ["cpuusage"],
          filterOptions: {},
        });
      } else {
        setState({
          ...state,
          showGraph: selected,
          list: ["avg_cpu_usage"],
          filterOptions: {},
        });
      }
    } else if (key === "showGraph" && selected === "memory") {
      if (state.interval === "instant") {
        setState({
          ...state,
          [key]: selected,
          list: ["memoryusage"],
          filterOptions: {
            memory: memoryOptions,
          },
        });
      } else {
        setState({
          ...state,
          [key]: selected,
          list: state.listMemory,
          filterOptions: {
            memory: memoryOptions,
          },
        });
      }
    }
  };

  const changeOptions = (value, e) => {
    const { list } = state;
    const { name, checked } = e.target;
    let selected = [];
    selected = !checked
      ? list.filter((value) => value !== name)
      : [...list, value];
    if (state.showGraph === "memory") {
      setState({ ...state, list: selected, listMemory: selected });
    }
  };

  const toggleFullscreen = (value) => {
    setState({ ...state, isFullScreen: value });
  };

  return (
    <>
      <Card className={state.isFullScreen ? "fullscreen" : ""}>
        <CardHeader className="pt-0">
          <GraphCardHeader
            id="network-throughput"
            interval={state.interval}
            formGroupProps={formGroupProps}
            filtersComponentProps={{
              list: state.list,
              options: state.filterOptions,
              optionsTitle: optionsTitle,
              changeOptions: changeOptions,
              changeValues: changeValues,
              showGraph: state.showGraph,
              graphDataOptions: [
                { value: "cpu", name: "CPU" },
                { value: "memory", name: "Memory" },
              ],
            }}
            handleIntervalChange={handleIntervalChange}
            isFullScreen={state.isFullScreen}
            toggleFullscreen={toggleFullscreen}
          />
        </CardHeader>
        <CardBody className="pb-0">
          <Row>
            <Col>
              {state.showGraph === "cpu" ? (
                <CpuGraph
                  {...props}
                  list={state.list}
                  interval={state.interval}
                />
              ) : (
                <MemoryGraph
                  {...props}
                  list={state.list}
                  interval={state.interval}
                />
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
}
