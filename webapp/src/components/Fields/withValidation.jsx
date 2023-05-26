import React from "react";
import classNames from "classnames";

export default function withValidation(Component) {
  class ComponentWithValidation extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        errorMessage: false,
        focus: false,
      };
    }

    render() {
      const { focus } = this.state;
      const {
        className,
        validate,
        track,
        makeLabel,
        configApply,
        configTestStarting,
        dispatch,
        disabled,
        tooltip,
        tooltipMessage,
        ...passThroughProps
      } = this.props;

      const componentClassName = classNames(className, {
        "has-error": this.props.validate,
        focus: focus,
      });

      return (
        <>
          <Component
            className={componentClassName}
            disabled={configTestStarting ? true : disabled}
            {...passThroughProps}
          />
          {this.props.validate ? (
            <div className="has-error error-message">{this.props.validate}</div>
          ) : null}
        </>
      );
    }
  }

  return ComponentWithValidation;
}
