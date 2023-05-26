import React from "react";

import { isNotEmpty } from "services/validation";

import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import SelectField from "components/Fields/SelectField";

export default class StaWpaEapSettings extends React.Component {
  constructor(props) {
    super(props);

    const { state } = this.props;

    this.state = {
      mode: state?.mode ? state.mode : "ttls",
      username: state?.username ? state.username : "",
      password: state?.password ? state.password : "",
    };

    // Passing state to config, because it doesn't have mode key by default
    // Select creates it only if mode changes
    if (!state?.mode) this.props.onChange(this.state);

    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevProps, _prevState, _snapshot) {
    if (prevProps.state != this.props.state) this.setState(this.props.state);
  }

  onChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(
      {
        [name]: value,
      },
      () => this.props.onChange(this.state)
    );
  }

  render() {
    const { trackChange, makeLabel } = this.props;

    return (
      <>
        <SelectField
          name="mode"
          label="EAP method:"
          value={this.state.mode}
          onChange={this.onChange}
          track={trackChange}
          makeLabel={makeLabel}
          options={[
            { value: "ttls", name: "EAP-TTLS/MSCHAPv2" },
            { value: "peap", name: "PEAP/MSCHAPv2" },
          ]}
        />

        <GenericInputField
          type="text"
          name="username"
          label="Username"
          value={this.state.username}
          onChange={this.onChange}
          validate={isNotEmpty}
          track={trackChange}
          makeLabel={makeLabel}
        />

        <SecretField
          name="password"
          label="Password"
          value={this.state.password}
          onChange={this.onChange}
          validate={isNotEmpty}
          track={trackChange}
          makeLabel={makeLabel}
        />
      </>
    );
  }
}
