import React from "react";
import { Tooltip } from "reactstrap";
import NotificationAlert from "react-notification-alert";

import Status from "services/status";
import browserStorage from "services/browserStorage";

export default class FirmwareVersion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipOpen: false,
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  componentDidMount() {
    const previousVersion = browserStorage.get("fwVersion");

    Status.load("system").then((result) => {
      const { version } = result.system;

      const currentVersion = version.firmux;

      if (previousVersion && previousVersion !== currentVersion) {
        this.notification.notificationAlert({
          place: "br",
          message: "Firmware has been updated",
          type: "info",
          autoDismiss: 8,
          closeButton: false,
        });
      }

      browserStorage.set("fwVersion", currentVersion);
      this.setState({ versions: version });
    });
  }

  render() {
    const { tooltipDisabled } = this.props;
    const { tooltipOpen, versions } = this.state;

    return (
      <>
        <div id="Tooltip">
          <i className="now-ui-icons travel_info" />{" "}
          <p>{versions ? versions[Object.keys(versions)[0]] : null}</p>
          <Tooltip
            placement="right"
            isOpen={tooltipOpen}
            target="Tooltip"
            toggle={this.toggle}
            disabled={tooltipDisabled}
          >
            {versions &&
              Object.keys(versions).map(function (key, index) {
                return (
                  <div key={index}>
                    {key}: {versions[key]}
                  </div>
                );
              })}
          </Tooltip>
        </div>

        <NotificationAlert ref={(ref) => (this.notification = ref)} />
      </>
    );
  }
}
