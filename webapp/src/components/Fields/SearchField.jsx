import React from "react";
import { Button, InputGroupAddon } from "reactstrap";

import GenericInputInGroup from "./GenericInputInGroup";
import MultiField from "./MultiField";

class SearchField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { clearValue, ...passThroughProps } = this.props;

    return (
      <MultiField className="hide-label">
        <GenericInputInGroup
          type="text"
          placeholder="Search"
          label="Search"
          {...passThroughProps}
        />
        <InputGroupAddon addonType="append">
          <Button
            onClick={() => {
              clearValue();
            }}
            color="neutral"
          >
            <i className={"now-ui-icons ui-1_simple-remove"} />
          </Button>
        </InputGroupAddon>
      </MultiField>
    );
  }
}

export default SearchField;
