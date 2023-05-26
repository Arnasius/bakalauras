import React from "react";
import PropTypes from "prop-types";
import { Button, InputGroupAddon } from "reactstrap";

import GenericInputInGroup from "./GenericInputInGroup";
import MultiField from "./MultiField";

class PrivateKeyField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      revealed: false,
    };

    this.revealToggle = this.revealToggle.bind(this);
  }

  render() {
    const { labelProps, label, makeLabel, generateKey, ...passThroughProps } =
      this.props;
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
          <Button onClick={this.revealToggle} color="neutral">
            <i className={"now-ui-icons education_glasses"} />
          </Button>
        </InputGroupAddon>
        <InputGroupAddon addonType="append">
          <Button onClick={generateKey} color="neutral">
            <i className={"now-ui-icons loader_refresh"} />
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

PrivateKeyField.propTypes = {
  labelProps: PropTypes.shape({}),
  generateKey: PropTypes.func,
  validate: PropTypes.func,
  track: PropTypes.func,
  makeLabel: PropTypes.func,
};

export default PrivateKeyField;
