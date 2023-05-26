import React from "react";
import PropTypes from "prop-types";
import SelectField from "components/Fields/SelectField";
import countryData from "./CountryData.json";

export class CountrySelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const options = countryData.countries.map((country) => ({
      value: country.code,
      name: country.name,
    }));

    return (
      <SelectField
        name="countryCode"
        label="Country"
        options={options}
        {...this.props}
      />
    );
  }
}

CountrySelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
