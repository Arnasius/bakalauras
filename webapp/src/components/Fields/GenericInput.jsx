import React from "react";
import PropTypes from "prop-types";
import { Input, Tooltip } from "reactstrap";

import withIdAndName from "components/Fields/withIdAndName";

import withLabel from "./withLabel";
import withValidation from "./withValidation";

const EnhancedInput = withValidation(withLabel(Input));

class GenericInput extends React.Component {
  constructor(props) {
    super(props);

    /* TooltipId cant chamge when state changes, otherwise tooltip crashes */
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
    const events = ["touchmove", "mouseover"];
    events.map((event) => {
      document.body.addEventListener(event, () => {
        // PERFORM MOUSEOUT ACTION
        if (this.state.tooltipOpen) {
          this.setState({ tooltipOpen: false });
        }
      });
    });
  }

  render() {
    const {
      value,
      autoComplete,
      id,
      tooltip,
      tooltipMessage,
      tooltipPlacement,
      ...passThroughProps
    } = this.props;

    const { tooltipOpen, tooltipId } = this.state;

    const inputValue =
      this.props.type === "number" && value != "" ? parseInt(value) : value;

    /* Keep auto-completion off by default */
    return (
      <div className={tooltip ? tooltipId : null}>
        <EnhancedInput
          {...passThroughProps}
          value={inputValue}
          id={id}
          autoComplete={autoComplete || "off"}
        />

        {tooltip ? (
          <Tooltip
            placement={tooltipPlacement ? tooltipPlacement : "right"}
            isOpen={tooltipOpen}
            target={"." + tooltipId}
            toggle={this.toggleTooltip}
            delay={0}
          >
            {tooltipMessage}
          </Tooltip>
        ) : null}
      </div>
    );
  }
}

GenericInput.propTypes = {
  autoComplete: PropTypes.string,
};

export default withIdAndName(GenericInput);
