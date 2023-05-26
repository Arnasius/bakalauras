import React from "react";
import { Tooltip } from "reactstrap";
import { Link } from "react-router-dom";
import ButtonField from "components/Fields/ButtonField";
import withIdAndName from "components/Fields/withIdAndName";
import { getCurrentOrganization } from "services/organizations";

class LinkField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
      tooltipId: "tooltip-" + props.id,
      organization: getCurrentOrganization(),
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
    if (this.state.organization === null) {
      this.setState({
        organization: getCurrentOrganization(),
      });
    }
  }

  render() {
    const {
      id,
      tooltip,
      tooltipMessage,
      title,
      color,
      size,
      button,
      type,
      text,
      noOrg,
      tooltipPlacement,
      dispatch,
      icon,
      className,
      disabled,
      to,
      ...passThroughProps
    } = this.props;

    const { tooltipOpen, tooltipId, organization } = this.state;
    let realPath = {
      pathname: to.pathname.includes("/organizations/")
        ? to.pathname
        : `/organizations/${organization}` + to.pathname,
      state: to.state || "",
      backUrl: to.backUrl || "",
    };

    let blockClass = "d-inline-block ";
    if (tooltip) {
      blockClass += tooltipId;
    }

    return (
      <div className={blockClass}>
        {disabled ? (
          <i className={icon} />
        ) : (
          <Link
            id={id}
            className={icon || className}
            to={noOrg ? to : realPath}
            {...passThroughProps}
          >
            {button ? (
              <ButtonField
                color={color}
                size={size}
                title={title}
                type={type}
              />
            ) : null}
            {text ? text : null}
          </Link>
        )}
        {tooltip ? (
          <Tooltip
            placement={tooltipPlacement ? tooltipPlacement : "right"}
            isOpen={tooltipOpen}
            target={"." + tooltipId}
            toggle={this.toggleTooltip}
            delay={0}
          />
        ) : null}
      </div>
    );
  }
}

export default withIdAndName(LinkField);
