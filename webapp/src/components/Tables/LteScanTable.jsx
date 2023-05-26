import React from "react";
import aplist from "services/ap";
import DrawTable from "components/DrawTable/DrawTable";

export default class LteScanTable extends React.Component {
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

  action(value) {
    let { scanResults } = this.state;

    let index = scanResults.indexOf(
      scanResults.find((obj) => obj.ssid === value)
    );

    this.props.onSelectedValue(scanResults[index]);
    this.props.toggle();
  }

  render() {
    let { scanResults, error } = this.state;

    return (
      <DrawTable
        data={scanResults}
        columns={{
          Description: {
            value: "description",
            visibleOnTablet: true,
          },
          MNC: {
            value: "mnc",
            sortFormat: parseFloat,
            format: (data) => `${data.mnc}`,
          },
          MCC: {
            value: "mcc",
            sortFormat: parseFloat,
            format: (data) => `${data.mcc}`,
          },
        }}
        sort
        search
        paginate
        noDataMessage={
          this.props.showOnClick ? "Scanning..." : "Perform scan to see results"
        }
        errorMessage={error}
      />
    );
  }
}
