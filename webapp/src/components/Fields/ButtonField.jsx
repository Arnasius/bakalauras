import React from "react";
import PropTypes from "prop-types";
import { Tooltip, Button } from "reactstrap";

import withIdAndName from "./withIdAndName";
class ButtonField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
      tooltipId: "tooltip-" + props.id,
    };

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    this.setState({ tooltipOpen: !this.state.tooltipOpen });
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
      id,
      tooltip,
      tooltipMessage,
      title,
      tooltipPlacement,
      dispatch,
      disabled,
      ...passThroughProps
    } = this.props;

    const { tooltipOpen, tooltipId } = this.state;

    return (
      <div className={"btnField " + (tooltip ? tooltipId : null)}>
        <Button disabled={disabled} {...passThroughProps} id={id}>
          {title}
        </Button>
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

ButtonField.propTypes = {
  autoComplete: PropTypes.string,
};

export default withIdAndName(ButtonField);
