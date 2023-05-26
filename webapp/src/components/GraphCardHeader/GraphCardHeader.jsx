import React, { useState, useEffect, useRef } from "react";
import { Col } from "reactstrap";

import SelectField from "../Fields/SelectField";
import LabelTooltip from "../LabelTooltip/LabelTooltip";
import CollapsibleFiltersLine from "../FiltersLine/CollapsibleFiltersLine";
import MultiSelectField from "components/Fields/MultiSelectField";
import { useOutsideClick } from "services/chart";

export default function GraphCardHeader(props) {
  const [state, setState] = useState({
    isOpen: false,
    openFilters: false,
  });

  const {
    name,
    interval,
    error,
    formGroupProps,
    handleIntervalChange,
    filtersComponentProps,
    isFullScreen,
    id,
  } = props;

  let intervalOptions = [];

  if (!props.hideInstantOption)
    intervalOptions.push({ value: "instant", name: "1 hour" });
  intervalOptions.push(
    { value: "interval1", name: "1 day" },
    { value: "interval2", name: "1 week" },
    { value: "interval3", name: "2 weeks" },
    { value: "interval4", name: "1 month" }
  );

  const className = `graph-block d-flex ${id ? "mb-0" : "mb-2"}`;

  const ref = useRef();

  useOutsideClick(ref, () => {
    setState({
      ...state,
      openFilters: false,
    });
  });

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return function cleanup() {
      document.removeEventListener("keydown", escFunction, false);
    };
  });

  const escFunction = (event) => {
    //close fullscreen view when esc btn is pressed;
    if (event.keyCode === 27) props.toggleFullscreen(false);
  };

  const toggleTooltip = () => {
    setState({
      ...state,
      isOpen: !state.isOpen || false,
    });
  };

  const toggleFilters = (value) => {
    setState({
      ...state,
      openFilters: value,
    });
  };

  const returnFiltersComponent = (intervalOptions) => {
    const {
      showGraph,
      options,
      optionsTitle,
      changeOptions,
      list,
      changeValues,
      graphDataOptions,
    } = props.filtersComponentProps;

    return (
      <CollapsibleFiltersLine
        openFilters={state.openFilters}
        toggleFilters={toggleFilters}
        firstHideFilter={{
          options,
          list,
          optionsTitle,
          isMulti: props.interval !== "instant",
          changeValue: changeOptions,
        }}
        secondHideFilter={{
          key: "showGraph",
          defaultValue: showGraph,
          onChange: changeValues,
          options: graphDataOptions,
          label: "Values:",
        }}
        thirdHideFilter={{
          key: "interval",
          label: "Interval:",
          defaultValue: props.interval,
          onChange: changeValues,
          options: intervalOptions,
        }}
      />
    );
  };

  return (
    <div ref={ref} className={className}>
      {!name ? null : (
        <Col
          xs="auto"
          id={id}
          className="m-auto ml-0 about vertical-align-middle"
          onClick={() => toggleFilters(false)}
        >
          {name}
          <LabelTooltip
            id={id}
            toggle={toggleTooltip}
            tooltipMessage={name}
            isOpen={state.isOpen}
            name={"tooltip-throughputInfo"}
          />
        </Col>
      )}
      <Col xs="auto" className={id ? "hide-on-mobile ml-auto" : "ml-auto pr-0"}>
        <SelectField
          name="interval"
          label="Interval:"
          value={interval}
          onChange={handleIntervalChange}
          options={intervalOptions}
          labelPosition="left"
          disabled={error}
          fieldProps={formGroupProps}
        />
        {!props.multiSelectField || !props.isMulti ? null : (
          <div className="label-left form-group">
            <MultiSelectField
              list={props.list}
              name="Filter:"
              selectClass="d-inline-block multi-block m-0"
              checked={props.list.length <= 1}
              data={props.options}
              defaultValue={props.list[0]}
              changeValue={props.changeOptions}
              optionsTitle={props.optionsTitle}
            />
          </div>
        )}
      </Col>
      {error || !filtersComponentProps
        ? null
        : returnFiltersComponent(intervalOptions)}

      <Col className={`icon-col ${id ? "" : "ml-auto pl-0 mb-1"}`} xs="auto">
        <div
          className={`icon-block ${isFullScreen ? "active" : "closed"}`}
          onClick={() => props.toggleFullscreen(!isFullScreen)}
        >
          <i className={isFullScreen ? "icon-minimise" : "icon-fullscreen"}></i>
        </div>
      </Col>
    </div>
  );
}
