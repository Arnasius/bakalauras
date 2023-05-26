import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { FormGroup } from "reactstrap";

import GenericInput from "./GenericInput";

class GenericInputField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { fieldProps, labelPosition, ...passThroughProps } = this.props;
    const formGroupClass = classNames(
      labelPosition ? `label-${labelPosition}` : "",
      fieldProps?.className
    );

    return this.props.multifield ? (
      <GenericInput {...passThroughProps} />
    ) : (
      <FormGroup {...fieldProps} className={formGroupClass}>
        <GenericInput {...passThroughProps} />
      </FormGroup>
    );
  }
}

GenericInputField.propTypes = {
  fieldProps: PropTypes.shape({}),
};

export default GenericInputField;
