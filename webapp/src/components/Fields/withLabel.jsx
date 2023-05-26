import React from "react";
import PropTypes from "prop-types";

import { Label } from "reactstrap";

export default function withLabel(Component) {
  class ComponentWithLabel extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const { labelProps, ...passThroughProps } = this.props;
      const { label, id } = passThroughProps;

      return (
        <>
          {label ? (
            <Label {...labelProps} for={id}>
              {label}
            </Label>
          ) : null}
          <Component {...passThroughProps} />
        </>
      );
    }
  }

  ComponentWithLabel.propTypes = {
    label: PropTypes.string,
    labelProps: PropTypes.shape({}),
    id: PropTypes.string,
  };

  return ComponentWithLabel;
}
