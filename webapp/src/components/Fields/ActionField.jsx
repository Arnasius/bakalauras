import React from "react";
import PropTypes from "prop-types";
import { Button, InputGroupAddon } from "reactstrap";

import GenericInputInGroup from "./GenericInputInGroup";
import MultiField from "./MultiField";

class ActionField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { labelProps, label, makeLabel, action, icon, ...passThroughProps } =
      this.props;

    const fieldProps = { label, labelProps };

    return (
      <MultiField {...fieldProps}>
        <GenericInputInGroup
          type={this.props.type}
          makeLabel={() => (makeLabel ? makeLabel(label) : null)}
          {...passThroughProps}
        />
        <InputGroupAddon addonType="append">
          <Button
            onClick={action}
            color="neutral"
            disabled={this.props.disabled ? true : false}
          >
            <i className={icon} />
          </Button>
        </InputGroupAddon>
      </MultiField>
    );
  }
}

ActionField.propTypes = {
  labelProps: PropTypes.shape({}),
  validate: PropTypes.string,
  track: PropTypes.func,
  makeLabel: PropTypes.func,
};

export default ActionField;
