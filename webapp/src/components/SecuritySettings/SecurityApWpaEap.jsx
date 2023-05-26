import React from "react";

import { isIpAddress, isPort, isNotEmpty } from "services/validation";

import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import SwitchField from "components/Fields/SwitchField";

export default class ApWpaEapSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.makeState(this.props.state);

    this.onChange = this.onChange.bind(this);
    this.saveState = this.saveState.bind(this);
  }

  makeState(radius) {
    return {
      authAddress: radius.auth.server,
      authPort: radius.auth.port,
      authSecret: radius.auth.secret,
      acctEnabled: radius.acct.enabled,
      acctAddress: radius.acct.server,
      acctPort: radius.acct.port,
      acctSecret: radius.acct.secret,
    };
  }

  saveState() {
    this.props.onChange({
      auth: {
        server: this.state.authAddress,
        port: Number(this.state.authPort),
        secret: this.state.authSecret,
      },
      acct: {
        enabled: this.state.acctEnabled,
        server: this.state.acctAddress,
        port: Number(this.state.acctPort),
        secret: this.state.acctSecret,
      },
    });
  }

  componentDidUpdate(prevProps, _prevState, _snapshot) {
    if (prevProps.state != this.props.state)
      this.setState(this.makeState(this.props.state));
  }

  onChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState(
      {
        [name]: value,
      },
      this.saveState
    );
  }

  render() {
    const { trackChange, makeLabel } = this.props;

    return (
      <>
        <GenericInputField
          type="text"
          name="authAddress"
          label="Authentication server address"
          value={this.state.authAddress}
          onChange={this.onChange}
          validate={isIpAddress}
          track={trackChange}
          makeLabel={makeLabel}
        />

        <GenericInputField
          type="number"
          name="authPort"
          label="Authentication server port"
          value={this.state.authPort}
          min="0"
          max="65535"
          onChange={this.onChange}
          validate={isPort}
          track={trackChange}
          makeLabel={makeLabel}
        />

        <SecretField
          name="authSecret"
          label="Authentication server password"
          value={this.state.authSecret}
          onChange={this.onChange}
          validate={isNotEmpty}
          track={trackChange}
          makeLabel={makeLabel}
        />

        <SwitchField
          name="acctEnabled"
          label="Accounting server"
          checked={this.state.acctEnabled}
          onChange={this.onChange}
          track={trackChange}
          makeLabel={makeLabel}
        />

        {this.state.acctEnabled ? (
          <>
            <GenericInputField
              type="text"
              name="acctAddress"
              label="Accounting server address"
              value={this.state.acctAddress}
              onChange={this.onChange}
              validate={isIpAddress}
              track={trackChange}
              makeLabel={makeLabel}
            />

            <GenericInputField
              type="number"
              name="acctPort"
              label="Accounting server port"
              value={this.state.acctPort}
              min="0"
              max="65535"
              onChange={this.onChange}
              validate={isPort}
              track={trackChange}
              makeLabel={makeLabel}
            />

            <SecretField
              name="acctSecret"
              label="Accounting server password"
              value={this.state.acctSecret}
              onChange={this.onChange}
              validate={isNotEmpty}
              track={trackChange}
              makeLabel={makeLabel}
            />
          </>
        ) : null}
      </>
    );
  }
}
