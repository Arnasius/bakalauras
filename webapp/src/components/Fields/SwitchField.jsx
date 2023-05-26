import { CustomInput, FormGroup } from "reactstrap";

import PropTypes from "prop-types";
import React, { Component } from "react";
import withValidation from "./withValidation";
import withIdAndName from "./withIdAndName";
import { Tooltip } from "reactstrap";

const EnhancedCustomInput = withValidation(CustomInput);

class SwitchField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
      tooltipId: "tooltip-" + props.id,
    };

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    const { tooltipOpen } = this.state;

    this.setState({
      tooltipOpen: !tooltipOpen,
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
    const {
      autoComplete,
      id,
      tooltip,
      switchClass,
      tooltipMessage,
      tooltipPlacement,
      value,
      tooltipTarget,
      ...passThroughProps
    } = this.props;
    const { tooltipOpen, tooltipId } = this.state;

    return (
      <FormGroup className={switchClass ? switchClass : null}>
        <div className={tooltip ? tooltipId : null}>
          <EnhancedCustomInput
            type="switch"
            {...passThroughProps}
            id={id}
            autoComplete={autoComplete || "off"}
            value={value}
          />
          {tooltip ? (
            <Tooltip
              placement={tooltipPlacement ? tooltipPlacement : "right"}
              isOpen={tooltipOpen}
              target={tooltipTarget ? tooltipTarget : "." + tooltipId}
              delay={0}
              toggle={this.toggleTooltip}
            >
              {tooltipMessage}
            </Tooltip>
          ) : null}
        </div>
      </FormGroup>
    );
  }
}

SwitchField.propTypes = {
  autoComplete: PropTypes.string,
};
export default withIdAndName(SwitchField);
