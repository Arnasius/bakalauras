import React from "react";
import PropTypes from "prop-types";
import { Input } from "reactstrap";

import withIdAndName from "components/Fields/withIdAndName";

import withLabel from "./withLabel";
import withValidation from "./withValidation";

const EnhancedInput = withValidation(withLabel(Input));

class GenericInputInGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { autoComplete, ...passThroughProps } = this.props;

    /* Keep auto-completion off by default */
    return (
      <EnhancedInput
        {...passThroughProps}
        autoComplete={autoComplete || "off"}
      />
    );
  }
}

GenericInputInGroup.propTypes = {
  autoComplete: PropTypes.string,
};

export default withIdAndName(GenericInputInGroup);
