import React, { Component } from "react";
import { Tooltip } from "reactstrap";

export default class LabelTooltip extends Component {
  render() {
    const {
      isOpen,
      target,
      toggle,
      tooltipMessage,
      tooltipPlacement,
      id,
      name,
    } = this.props;
    const element = document.getElementById(id);
    const disabled = element
      ? element?.offsetWidth >= element?.scrollWidth
      : true;

    return (
      <Tooltip
        placement={tooltipPlacement ? tooltipPlacement : "right"}
        isOpen={disabled ? false : isOpen}
        target={target ? target : id}
        toggle={name ? () => toggle(name) : toggle}
        delay={0}
      >
        {tooltipMessage}
      </Tooltip>
    );
  }
}
