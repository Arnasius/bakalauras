import React from "react";
import aplist from "services/ap";
import DrawTable from "components/DrawTable/DrawTable";

import { Button } from "reactstrap";

export default class ScanTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scanResults: [],
      error: null,
    };

    this.action = this.action.bind(this);

    this.sendScan = this.sendScan.bind(this);
    this.loadScanResults = this.loadScanResults.bind(this);
  }

  componentDidUpdate(prevProps, _prevState) {
    this.props.isScanning != prevProps.isScanning &&
      this.props.isScanning &&
      this.sendScan();
  }

  componentDidMount() {
    this.props.showOnClick && this.sendScan();
  }

  sendScan() {
    this.setState({ scanResults: [] }, this.loadScanResults);
  }

  loadScanResults() {
    aplist
      .load(this.props.radio)
      .catch(() =>
        this.setState(
          { error: "Failed to load data" },
          this.props.setIsScanning(false)
        )
      )
      .then((stats) => {
        this.setState(
          { scanResults: stats.scanResults },
          this.props.setIsScanning(false)
        );
      });
  }

  action(data) {
    let { scanResults } = this.state;

    let index = scanResults.indexOf(scanResults.find((obj) => obj === data));

    this.props.onSelectedValue(scanResults[index]);
    this.props.toggle();
  }

  render() {
    let { scanResults, error } = this.state;
    let { hasAction, showOnClick } = this.props;

    scanResults.length &&
      scanResults.map((result) => {
        Object.assign(result, {
          securityString:
            result.security[0].mode +
            (result.security[0].keymng === "PSK" ? "-PSK" : ""),
        });
      });

    return (
      <DrawTable
        data={scanResults}
        columns={{
          SSID: {
            value: "ssid",
            visibleOnTablet: true,
          },
          BSSID: { value: "mac" },
          Channel: {
            value: "channel",
            format: (data) =>
              `${data.channel} (${data.freq} MHz), ${data.bw} MHz`,
            sortFormat: parseFloat,
          },
          Signal: {
            value: "signal",
            format: (data) => `${data.signal} dBm`,
            sortFormat: parseFloat,
          },
          Security: { value: "securityString" },
        }}
        action={
          hasAction && {
            func: this.action,
            component: <SelectButton />,
            value: "ssid",
          }
        }
        sort
        search
        paginate
        noDataMessage={
          showOnClick ? "Scanning..." : "Perform scan to see results"
        }
        errorMessage={error}
      />
    );
  }
}

function SelectButton() {
  return <Button color="primary">Select</Button>;
}
