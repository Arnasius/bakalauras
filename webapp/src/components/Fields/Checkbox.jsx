import React, { Component } from "react";
import { CustomInput, FormGroup, Tooltip, Label } from "reactstrap";

import withValidation from "./withValidation";
import withIdAndName from "./withIdAndName";

const EnhancedCustomInput = withValidation(CustomInput);

class Checkbox extends Component {
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
      tooltipMessage,
      tooltipPlacement,
      type,
      label,
      ...passThroughProps
    } = this.props;
    const { tooltipOpen, tooltipId } = this.state;

    return (
      <FormGroup className="my-auto d-flex">
        <span className={tooltip ? tooltipId : null}>
          <EnhancedCustomInput
            type={type ? type : "checkbox"}
            className={!label ? "" : "mr-1"}
            {...passThroughProps}
            id={id}
          />
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
        </span>
        {!label ? null : <Label className="m-0">{label}</Label>}
      </FormGroup>
    );
  }
}

export default withIdAndName(Checkbox);
