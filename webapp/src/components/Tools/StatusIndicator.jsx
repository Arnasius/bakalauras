import React from "react";
import { Tooltip } from "reactstrap";

export default class StatusIndicator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
    };

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
    const { target, color, message, placement, tooltipTarget } = this.props;
    const { tooltipOpen } = this.state;

    return (
      <>
        <div className={`rounded-circle align-self-center ${color}`} />
        <Tooltip
          placement={placement ? placement : "left"}
          isOpen={tooltipOpen}
          target={tooltipTarget ? tooltipTarget : target}
          toggle={this.toggleTooltip}
        >
          {message}
        </Tooltip>
      </>
    );
  }
}
