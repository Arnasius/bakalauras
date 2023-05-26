import React from "react";

import { isPassphrase } from "services/validation";

import SecretField from "components/Fields/SecretField";

export default class WpaPskSettings extends React.Component {
  constructor(props) {
    super(props);

    const { state } = this.props;

    this.state = {
      passphrase: !state?.passphrase ? "" : state.passphrase,
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevProps, _prevState, _snapshot) {
    if (prevProps.state != this.props.state) this.setState(this.props.state);
  }

  onChange(event) {
    this.setState(
      {
        passphrase: event.target.value,
      },
      () => this.props.onChange(this.state)
    );
  }

  render() {
    const { trackChange, makeLabel } = this.props;

    return (
      <>
        <SecretField
          name="passphrase"
          label="Passphrase"
          value={this.state.passphrase}
          onChange={this.onChange}
          validate={isPassphrase}
          track={trackChange}
          makeLabel={makeLabel}
        />
      </>
    );
  }
}
