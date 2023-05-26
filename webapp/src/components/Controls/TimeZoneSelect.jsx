import React from "react";
import PropTypes from "prop-types";

import timeZoneData from "./TimeZoneData.json";
import SelectField from "components/Fields/SelectField";

export class TimeZoneSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timezones: this.buildTimeZones(this.props.country),
      timezone: this.props.value,
    };

    this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
  }

  render() {
    const { timezones, timezone } = this.state;

    const options = timezones.map((timezone) => ({
      value: timezone.name,
      name: timezone.description,
      disabled: timezone.meta,
    }));

    return (
      <SelectField
        name="timeZone"
        label="Time zone"
        value={timezone}
        onChange={this.handleTimeZoneChange}
        track={this.props.track}
        makeLabel={this.props.makeLabel}
        options={options}
      />
    );
  }

  componentDidUpdate(prevProps) {
    const { value, onChange, country } = this.props;

    if (prevProps.value != value)
      this.setState(
        {
          timezone: value,
        },
        () =>
          onChange({
            timeZoneName: value,
            timeZone: this.buildTimeZoneUtc(timeZoneData.timezones[value]),
          })
      );

    if (prevProps.country != country)
      this.setState({
        timezones: this.buildTimeZones(country),
      });
  }

  handleTimeZoneChange(event) {
    const { target } = event;
    const { value } = target;

    this.setState(
      {
        timezone: value,
      },
      () =>
        this.props.onChange({
          timeZoneName: value,
          timeZone: this.buildTimeZoneUtc(timeZoneData.timezones[value]),
        })
    );
  }

  buildTimeZoneUtc(timeZone, pretty) {
    if (!timeZone || timeZone.offset === undefined) return "UTC+0";

    let timeZoneUtc = "UTC";
    if (timeZone.offset < 0) timeZoneUtc += "" + timeZone.offset;
    else if (timeZone.offset === 0)
      timeZoneUtc += pretty ? "±" + timeZone.offset : "";
    else if (timeZone.offset > 0) timeZoneUtc += "+" + timeZone.offset;
    return timeZoneUtc;
  }

  buildTimeZones(country) {
    let timeZoneOthers = [];
    let timeZoneCountry = [];

    Object.keys(timeZoneData.timezones).map((timeZoneName) => {
      let timeZone = timeZoneData.timezones[timeZoneName];

      let timeZoneUtc = this.buildTimeZoneUtc(timeZone, true);
      let timeZoneItem = {
        name: timeZoneName,
        description: `(${timeZoneUtc}) ${timeZoneName.replace("_", " ")}`,
        offset: timeZone.offset,
      };

      if (country !== timeZone.country) timeZoneOthers.push(timeZoneItem);
      else timeZoneCountry.push(timeZoneItem);
    });

    let sortFn = (a, b) => a.offset - b.offset;
    timeZoneCountry.sort(sortFn);
    timeZoneOthers.sort(sortFn);
    if (!timeZoneCountry.length) {
      return timeZoneOthers;
    } else {
      return [
        {
          name: "-country",
          description: `-- ${timeZoneData.countries[country]} time zones --`,
          meta: true,
        },
        ...timeZoneCountry,
        {
          name: "-others",
          description: "-- Other countries time zones --",
          meta: true,
        },
        ...timeZoneOthers,
      ];
    }
  }
}

TimeZoneSelect.propTypes = {
  value: PropTypes.string,
  country: PropTypes.string,
  onChange: PropTypes.func,
};
