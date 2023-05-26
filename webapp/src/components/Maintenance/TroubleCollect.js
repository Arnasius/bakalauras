import React from "react";

import { datetimeStamp } from "services/text";

export default class TroubleCollect extends React.Component {
  constructor(props) {
    super(props);

    this.troubleDownload = this.troubleDownload.bind(this);
  }

  troubleDownload() {
    let url = window.location.origin;
    if (!url) url = window.location.protocol + "//" + window.location.host;
    url += "/cgi.lua/diagnose?date=" + datetimeStamp();
    window.open(url);
  }

  render() {
    return (
      <div className="nav-link" onClick={this.troubleDownload}>
        Fetch troubleshooting file
      </div>
    );
  }
}
