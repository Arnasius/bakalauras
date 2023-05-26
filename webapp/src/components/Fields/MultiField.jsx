import React from "react";
import { FormGroup, InputGroup } from "reactstrap";
import PropTypes from "prop-types";

import withLabel from "./withLabel";
import withValidation from "./withValidation";
import withIdAndName from "./withIdAndName";

const EnhancedInputGroup = withLabel(withValidation(InputGroup));

function MultiField(props) {
  const { fieldProps, ...passThroughProps } = props;

  let children = React.Children.toArray(props.children).map((child) =>
    React.cloneElement(child, { multifield: "true" })
  );

  return (
    <FormGroup {...fieldProps}>
      <EnhancedInputGroup {...passThroughProps}>{children}</EnhancedInputGroup>
    </FormGroup>
  );
}

MultiField.propTypes = {
  fieldProps: PropTypes.shape({}),
  children: PropTypes.array,
};

export default withIdAndName(MultiField);
