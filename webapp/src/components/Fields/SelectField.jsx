import React from "react";
import { isValueSelected } from "services/validation";
import GenericInputField from "./GenericInputField";
import { Tooltip } from "reactstrap";

export default class SelectField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
      tooltipId: "tooltip-" + props.id,
    };

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    this.setState({ tooltipOpen: !this.state.tooltipOpen });
  }

  render() {
    const {
      name,
      label,
      value,
      options,
      onChange,
      track,
      makeLabel,
      getValue,
      getOption,
      tooltip,
      tooltipMessage,
      tooltipPlacement,
      ...passThroughProps
    } = this.props;

    let availableValues = [];

    options.map((option) =>
      availableValues.push(
        getValue ? getValue(option) : option.value ? option.value : option
      )
    );
    function validate() {
      if (isValueSelected(value, options))
        return isValueSelected(value, options);
    }

    const { tooltipOpen, tooltipId } = this.state;

    return (
      <div className={"selectField " + (tooltip ? tooltipId : null)}>
        <GenericInputField
          type="select"
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          validate={validate()}
          track={track}
          makeLabel={makeLabel}
          {...passThroughProps}
        >
          {value === "" && <option> </option>}
          {options.map((option, index) => (
            <option
              key={index}
              value={availableValues[index]}
              disabled={option.disabled}
            >
              {getOption
                ? getOption(option)
                : option.name
                ? option.name
                : option}
            </option>
          ))}
        </GenericInputField>
        {tooltip ? (
          <Tooltip
            placement={tooltipPlacement ? tooltipPlacement : "right"}
            isOpen={tooltipOpen}
            target={"." + tooltipId}
            toggle={this.toggleTooltip}
            delay={0}
          >
            {tooltipMessage}
          </Tooltip>
        ) : null}
      </div>
    );
  }
}
