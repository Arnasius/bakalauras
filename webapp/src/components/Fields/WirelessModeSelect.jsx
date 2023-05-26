import React from "react";
import SelectField from "./SelectField";

export default class WirelessModeSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      value,
      onChange,
      track,
      makeLabel,
      tooltipMessage,
      disabled,
      name,
      label,
    } = this.props;

    return (
      <SelectField
        name={name ? name : "wirelessMode"}
        label={label ? label : "Wireless mode"}
        value={value}
        onChange={onChange}
        track={track}
        makeLabel={makeLabel}
        options={[
          { value: "ap", name: "Access point" },
          { value: "sta", name: "Station" },
        ]}
        disabled={disabled}
        tooltip={disabled}
        tooltipMessage={tooltipMessage}
      />
    );
  }
}
