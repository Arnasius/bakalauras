import React from "react";
import PropTypes from "prop-types";
import { Button, InputGroupAddon } from "reactstrap";

import GenericInputInGroup from "./GenericInputInGroup";
import MultiField from "./MultiField";

class CopyValueField extends React.Component {
  constructor(props) {
    super(props);

    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  copyToClipboard() {
    let copyText = document.getElementById("target");
    copyText.select();
    document.execCommand("copy");
  }

  render() {
    const { labelProps, label, makeLabel, ...passThroughProps } = this.props;
    const fieldProps = { label, labelProps };

    return (
      <MultiField {...fieldProps}>
        <GenericInputInGroup
          type="text"
          id="target"
          makeLabel={() => (makeLabel ? makeLabel(label) : null)}
          {...passThroughProps}
        />
        <InputGroupAddon addonType="append">
          <Button
            onClick={this.copyToClipboard}
            color={this.props.readOnly ? "readonly" : "neutral"}
          >
            <i className={"now-ui-icons files_single-copy-04"} />
          </Button>
        </InputGroupAddon>
      </MultiField>
    );
  }
}

CopyValueField.propTypes = {
  labelProps: PropTypes.shape({}),
  makeLabel: PropTypes.func,
};

export default CopyValueField;
