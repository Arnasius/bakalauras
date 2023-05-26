import React from "react";
import PropTypes from "prop-types";
import { Button, InputGroupAddon } from "reactstrap";

import GenericInputInGroup from "./GenericInputInGroup";
import MultiField from "./MultiField";

class SecretField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      revealed: false,
    };

    this.revealToggle = this.revealToggle.bind(this);
  }

  render() {
    const { labelProps, label, makeLabel, ...passThroughProps } = this.props;
    const { revealed } = this.state;

    const fieldProps = { label, labelProps };

    return (
      <MultiField {...fieldProps}>
        <GenericInputInGroup
          type={revealed ? "text" : "password"}
          makeLabel={() => (makeLabel ? makeLabel(label) : null)}
          {...passThroughProps}
        />
        <InputGroupAddon addonType="append">
          <Button
            disabled={passThroughProps.disabled}
            onClick={this.revealToggle}
            color="neutral"
          >
            <i className={"now-ui-icons education_glasses"} />
          </Button>
        </InputGroupAddon>
      </MultiField>
    );
  }

  revealToggle() {
    const { revealed } = this.state;
    this.setState({ revealed: !revealed });
  }
}

SecretField.propTypes = {
  labelProps: PropTypes.shape({}),
  validate: PropTypes.string,
  track: PropTypes.func,
  makeLabel: PropTypes.func,
};

export default SecretField;
