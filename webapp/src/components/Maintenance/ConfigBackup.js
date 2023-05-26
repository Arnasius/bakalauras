import React from "react";

import { Button } from "reactstrap";

import { datetimeStamp } from "services/text";

export default class ConfigBackup extends React.Component {
  constructor(props) {
    super(props);

    this.configBackup = this.configBackup.bind(this);
  }

  render() {
    return (
      <div>
        <div>Export system settings</div>
        <p className="description">
          Download a copy of the current device configuration:
        </p>
        <Button color="primary" onClick={this.configBackup}>
          Download file
        </Button>
      </div>
    );
  }
  configBackup() {
    let url = window.location.origin;
    if (!url) url = window.location.protocol + "//" + window.location.host;
    url += "/cgi.lua/snapshot?date=" + datetimeStamp();
    window.open(url);
  }
}
