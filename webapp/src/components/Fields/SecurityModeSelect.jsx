import React from "react";
import SelectField from "./SelectField";

export default class SecurityModeSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      value,
      onChange,
      track,
      makeLabel,
      excludeWpaeap,
      inCard,
      allowWpa3,
    } = this.props;

    let options = [
      { value: "open", name: "Open" },
      { value: "wpapsk", name: "WPA2 personal" },
    ];

    if (!excludeWpaeap) {
      options.push(
        { value: "wpaeap", name: "WPA2 enterprise" },
        { value: "wpaeap256", name: "WPA3 enterprise" }
      );
    }

    if (allowWpa3) {
      options.push(
        { value: "sae", name: "WPA3 personal" },
        { value: "wpapsksae", name: "WPA2 personal + WPA3 personal" }
      );
    }

    return (
      <SelectField
        name="securityMode"
        label={inCard ? "Mode" : "Security mode"}
        value={value}
        onChange={onChange}
        track={track}
        makeLabel={makeLabel}
        options={options}
      />
    );
  }
}
