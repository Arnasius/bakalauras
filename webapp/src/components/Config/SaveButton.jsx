import React from "react";
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import alive from "services/alive";
import notify from "services/notify";
import config from "services/config";

import { BlockControl } from "state/block";
import { ConfigAction } from "state/config";

import ButtonField from "components/Fields/ButtonField";

@BlockControl
@ConfigAction
export default class SaveButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };

    this.apply = this.apply.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  toggleDropdown() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  apply() {
    this.props.configApplyStart();
    this.props.blockInfo("Applying configuration. Please wait...");
    config
      .apply()
      .then((result) => {
        return (result && result.reload) || {};
      })
      .then((reload) => {
        return alive.verify(reload.recovery).then(
          (redirect) => {
            this.props.blockOff();
            notify.emit("success", "Configuration applied successfully.");
            redirect ? alive.redirect(reload.recovery.newAddress) : null;
            this.props.configApplyEnd();
            this.props.navigate ? this.props.navigate() : null;
            return reload;
          },
          () => {
            this.props.blockOff();
            notify.emit(
              "error",
              "Cannot re-connect to device. Please check network configuration and reload page."
            );
            this.props.configApplyEnd({ error: true });
            this.props.navigate ? this.props.navigate() : null;
            return alive.preserve();
          }
        );
      });
  }

  render() {
    const {
      disabled,
      startTest,
      dropdown,
      confirmTestChanges,
      configTestAllowed,
    } = this.props;
    const { isOpen } = this.state;
    const tooltipMessage =
      "Please fix configuration errors before saving changes";

    if (dropdown && configTestAllowed) {
      return (
        <ButtonDropdown isOpen={isOpen} toggle={this.toggleDropdown}>
          <ButtonField
            title="Save"
            color="primary"
            className="saveBtn"
            onClick={this.apply}
            disabled={disabled}
            tooltipMessage={tooltipMessage}
            tooltip={disabled}
          />
          <DropdownToggle
            disabled={disabled}
            color="primary"
            className="dropdown-toggle"
          >
            <i className="now-ui-icons arrows-1_minimal-down" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={startTest}>Test changes</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      );
    } else if (dropdown) {
      return (
        <ButtonField
          color="primary"
          className="saveBtn"
          onClick={this.apply}
          disabled={disabled}
          tooltipMessage={tooltipMessage}
          tooltip={disabled}
          title="Save"
          tooltipPlacement="bottom"
        />
      );
    } else if (this.props.navigate) {
      return (
        <ButtonField
          color="primary"
          disabled={disabled}
          tooltipMessage={tooltipMessage}
          tooltip={disabled}
          onClick={this.apply}
          title={this.props.title}
        />
      );
    } else {
      return (
        <Button
          color="primary"
          className="saveBtn"
          onClick={confirmTestChanges}
        >
          Confirm
        </Button>
      );
    }
  }
}
