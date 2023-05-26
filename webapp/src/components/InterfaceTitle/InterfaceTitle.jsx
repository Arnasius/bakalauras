import React, { Component } from "react";

import LabelTooltip from "components/LabelTooltip/LabelTooltip";
import InterfaceIcon from "components/InterfaceIcon/InterfaceIcon";
import { interfaceLabel } from "services/filter";
import InjectCapabilities from "state/capabilities";
@InjectCapabilities
class InterfaceTitle extends Component {
  render() {
    const { name, vaps, zones, capabilities, className, status, target } =
      this.props;
    const id = target ? `x-${target}` : null;
    const result = { name, className, vaps, zones, capabilities };
    const label = interfaceLabel(name, capabilities, vaps, zones);
    return (
      <InterfaceIcon {...result}>
        {status ? (
          <div>
            <div id={target}>
              <span id={id} className="text-truncate">
                {label}
              </span>
              <LabelTooltip
                label={label}
                id={id}
                toggle={this.props.toggle}
                tooltipMessage={this.props.tooltipMessage}
                tooltipPlacement={this.props.tooltipPlacement}
                isOpen={this.props.isOpen}
                target={target}
              />
            </div>
            {status ? status : null}
          </div>
        ) : (
          <span id={target} className="iface-title m-1">
            <span id={id} className={target ? "text-truncate m-0" : null}>
              {label}
            </span>
            {target ? (
              <LabelTooltip
                label={label}
                id={id}
                toggle={this.props.toggle}
                tooltipMessage={this.props.tooltipMessage || label}
                tooltipPlacement={this.props.tooltipPlacement}
                isOpen={this.props.isOpen}
                target={target}
              />
            ) : null}
          </span>
        )}
      </InterfaceIcon>
    );
  }
}

export default InterfaceTitle;
