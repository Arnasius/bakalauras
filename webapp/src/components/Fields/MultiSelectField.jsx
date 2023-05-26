import React, { Component } from "react";
import { Tooltip } from "reactstrap";
import PropTypes from "prop-types";
import Checkbox from "./Checkbox";
import withIdAndName from "./withIdAndName";
import { ClosureComponent } from "components/Controls/ClosureComponent";

class MultiSelectField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
      tooltipId: "tooltip-" + props.id,
      dropdownExpanded: false,
    };

    const { track, makeLabel, list, defaultValue, name } = this.props;
    let newlist = list.length > 1 ? list.sort().join(", ") : defaultValue;

    makeLabel && track(true, newlist, makeLabel(name), name);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentWillUnmount() {
    const { name, track } = this.props;
    if (track) track(null, null, null, name);
  }

  toggleDropdown(value) {
    this.setState({ dropdownExpanded: value });
  }

  componentDidUpdate() {
    const { track, makeLabel, list, defaultValue, name } = this.props;
    let newlist = list.length > 1 ? list.sort().join(", ") : defaultValue;

    makeLabel && track(true, newlist, makeLabel(name), name);

    document.body.addEventListener("touchmove", () => {
      // PERFORM MOUSEOUT ACTION
      if (this.state.tooltipOpen) {
        this.setState({ tooltipOpen: false });
      }
    });
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  render() {
    const {
      tooltip,
      tooltipMessage,
      defaultValue,
      list,
      data,
      tooltipPlacement,
      disabled,
      selectClass,
      optionsTitle,
      allowEmpty,
    } = this.props;
    const { tooltipOpen, tooltipId, dropdownExpanded } = this.state;

    let allOptions = [];
    Object.keys(data).map((x) =>
      data[x].map((y) => {
        (y.title = x), allOptions.push(y);
      })
    );

    return (
      <ClosureComponent toggle={this.toggleDropdown}>
        <div className="multi-select">
          <label className="mr-1">{this.props.name}</label>
          <div
            className={`position-relative ${tooltip ? tooltipId : ""} ${
              selectClass ? selectClass : ""
            }`}
          >
            <button
              onClick={() =>
                !disabled ? this.toggleDropdown(!dropdownExpanded) : null
              }
              className={
                "form-control text-left text-truncate" +
                (disabled ? "disabled" : "")
              }
              disabled={disabled}
            >
              {!list.length && defaultValue !== "auto"
                ? "No selection"
                : list.length > 1
                ? `Selected ${list.length} from ${
                    allOptions.filter((option) => option.value !== "auto")
                      .length
                  }`
                : allOptions
                    .filter((x) => x.value.toString() === defaultValue)
                    .map(
                      (c) => `${c.name} ${optionsTitle ? `(${c.title})` : ""}`
                    ) || "auto"}
            </button>
            <select className="position-absolute m-0" />
            {dropdownExpanded ? (
              <div className="dropdown bg-white position-absolute border">
                {Object.keys(data).map((x, y) => {
                  return (
                    <div key={y} className={`${y === 0 ? "mb-1" : ""}`}>
                      {optionsTitle?.[x] ? (
                        <span className="ml-1 about"> {optionsTitle[x]} </span>
                      ) : null}
                      {data[x].map((option, i) => {
                        let value = option.value.toString();
                        let name = option.name;
                        let isLast = defaultValue
                          ? defaultValue.toString() === value
                          : false;

                        return (
                          <div key={i} className="pl-1">
                            <Checkbox
                              name={value}
                              label={name}
                              value={value}
                              disabled={
                                list.length <= 1 && isLast && !allowEmpty
                              }
                              checked={
                                list.includes(value) ||
                                (list.length <= 1 && isLast & !allowEmpty)
                              }
                              onChange={(e) => {
                                this.props.changeValue(value, e);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              ""
            )}
            {tooltip ? (
              <Tooltip
                placement={tooltipPlacement ? tooltipPlacement : "right"}
                isOpen={tooltipOpen}
                target={"." + tooltipId}
                toggle={this.toggleTooltip}
              >
                {tooltipMessage}
              </Tooltip>
            ) : null}
          </div>
        </div>
      </ClosureComponent>
    );
  }
}

MultiSelectField.propTypes = {
  track: PropTypes.func,
  makeLabel: PropTypes.func,
  list: PropTypes.array,
  options: PropTypes.array,
};

export default withIdAndName(MultiSelectField);
