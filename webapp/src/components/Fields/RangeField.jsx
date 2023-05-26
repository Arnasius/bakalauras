import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Input } from "reactstrap";

import GenericInputField from "./GenericInputField";
import MultiField from "./MultiField";
import withValidation from "./withValidation";

const EnhancedInput = withValidation(Input);

class RangeField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      labelProps,
      label,
      validate,
      track,
      makeLabel,
      blockClass,
      ...passThroughProps
    } = this.props;
    const { className } = passThroughProps;

    const fieldProps = { label, labelProps };
    let MultiFieldClass = `${
      className + " " + blockClass
    } width-content flex-nowrap`;
    return (
      <MultiField {...fieldProps} className={MultiFieldClass}>
        <GenericInputField
          type="number"
          validate={validate}
          track={track}
          makeLabel={() => (makeLabel ? makeLabel(label) : null)}
          {...passThroughProps}
        />
        <div>
          <EnhancedInput
            type="range"
            {...passThroughProps}
            className={classNames(className, "slider")}
          />
        </div>
      </MultiField>
    );
  }
}

RangeField.propTypes = {
  labelProps: PropTypes.shape({}),
  validate: PropTypes.func,
  track: PropTypes.func,
  makeLabel: PropTypes.func,
};

export default RangeField;
