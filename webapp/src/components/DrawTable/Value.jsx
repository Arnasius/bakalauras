import React from "react";
import { Tooltip } from "reactstrap";
import { splitStringByValue, arrayToMarkedComponent } from "./utils";

export default class Value extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tooltipOpen: false };

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  componentDidUpdate() {
    document.body.addEventListener("touchmove", () => {
      // PERFORM MOUSEOUT ACTION
      if (this.state.tooltipOpen) {
        this.setState({ tooltipOpen: false });
      }
    });
  }

  render() {
    const { tooltipOpen } = this.state;
    const { header, data, columns, searchValue, index } = this.props;
    let { value, format, getTooltipMessage, hideOnTable } = columns[header];

    let formattedValue =
      typeof data[value] === "undefined" || data[value] === null
        ? "-"
        : data[value].toString();
    formattedValue !== "-" && format && (formattedValue = format(data));

    if (searchValue && formattedValue?.toLowerCase().includes(searchValue)) {
      const parts = splitStringByValue(formattedValue, searchValue);
      formattedValue = arrayToMarkedComponent(parts, searchValue);
    }

    let hide = false;
    if (hideOnTable) hide = hideOnTable(data);
    if (hide) formattedValue = "";
    let target = `${value}-${index}`;

    return (
      <span id={target}>
        <span
          className={
            columns[header].badge && "badge " + columns[header].badge(data)
          }
        >
          {formattedValue.length ? formattedValue : "-"}
        </span>
        {getTooltipMessage ? (
          <Tooltip
            placement="right"
            isOpen={tooltipOpen}
            target={target}
            toggle={this.toggleTooltip}
          >
            {getTooltipMessage(data)}
          </Tooltip>
        ) : null}
      </span>
    );
  }
}
