import React from "react";
import { Button } from "reactstrap";

import { BlockControl } from "state/block";

import http from "services/http";
import alive from "services/alive";
import notify from "services/notify";
import WebSockets from "services/ws";

import Spinner from "components/Tools/Spinner";
import SwitchField from "components/Fields/SwitchField";

const UPDATE_URI = "/cgi.lua/update";

@BlockControl
export default class FirmwareUpdate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firmwareUpdateState: null,
      firmwareUpdateInfo: null,
      disableUpdate: false,
      reset: false,
    };

    this.onChange = this.onChange.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.updateFirmware = this.updateFirmware.bind(this);
    this.removeFirmware = this.removeFirmware.bind(this);
    this.activateUploadFirmware = this.activateUploadFirmware.bind(this);
  }

  onChange(event) {
    let { name, checked } = event.target;

    this.setState({
      [name]: checked,
    });
  }

  render() {
    return (
      <div>
        <p className="description">Update system firmware version:</p>
        <SwitchField
          name="reset"
          checked={!!this.state.reset}
          onChange={this.onChange}
          label="Reset config after device update"
        />
        {!this.state.firmwareUpdateInfo ? (
          <div>
            <Button color="primary" onClick={this.activateUploadFirmware}>
              {this.state.firmwareUpdateState === true ? (
                <>
                  <i className="now-ui-icons ui-1_check"></i>
                </>
              ) : null}
              {this.state.firmwareUpdateState === "wait" ? (
                <Spinner className="p-0" />
              ) : null}
              {this.state.firmwareUpdateState ? null : "Upload file"}
            </Button>
            <input
              type="file"
              name=""
              className="hidden"
              id="firmware-input"
              ref={(ref) => (this.firmwareInput = ref)}
              onChange={this.uploadFile}
            />
          </div>
        ) : (
          <>
            <Button
              color="primary"
              onClick={this.updateFirmware}
              disabled={this.state.disableUpdate ? true : false}
            >
              {this.state.disableUpdate ? (
                <Spinner className="p-0" />
              ) : (
                "Update"
              )}
            </Button>
            <Button color="secondary" onClick={this.removeFirmware}>
              Cancel
            </Button>
          </>
        )}
      </div>
    );
  }

  activateUploadFirmware() {
    var object = this.firmwareInput;
    object.click();
  }

  uploadFile(event) {
    const target = event.target;
    const file = event.target.files[0];
    if (file.size < 3000000 || file.size > 30000000) {
      this.setState({
        firmwareUpdateState: false,
      });
      notify.emit("error", "Invalid firmware image file.");
      return;
    }

    this.setState({
      firmwareUpdateState: "wait",
    });

    const formData = new FormData();
    formData.append("fw", file);

    http.put(UPDATE_URI, formData).then(
      (result) => {
        this.setState({
          firmwareUpdateState: true,
          firmwareUpdateInfo: result,
        });
      },
      (reason) => {
        /* Reset input in order to allow next selection */
        target.value = "";
        this.setState({
          firmwareUpdateState: false,
        });
        console.error(reason);
        // TODO(edzius): update user notification verbosity
        notify.emit("error", "Firmware image upload failed.");
      }
    );
  }

  updateFirmware() {
    this.setState({ disableUpdate: true });
    if (!this.state.firmwareUpdateInfo)
      throw new Error("BUG: firmware update info missing");

    WebSockets.disconnect();
    const options = { reset: !!this.state.reset };
    http.post(UPDATE_URI, options).then(
      (_result) => {
        this.props.blockInfo("Device firmware is updating. Please wait...");
        alive.wait(10).then(
          () => {
            this.props.blockOff();
            alive.reload();
          },
          () => {
            this.props.blockFail(
              "Cannot re-connect to device. Please check network configuration and reload page."
            );
          }
        );
      },
      (reason) => {
        this.setState({
          firmwareUpdateState: null,
          firmwareUpdateInfo: null,
          disableUpdate: false,
        });
        console.error(reason);
        // TODO(edzius): update user notification verbosity
        notify.emit("error", "Firmware update failed.");
      }
    );
  }

  removeFirmware() {
    if (!this.state.firmwareUpdateInfo)
      throw new Error("BUG: firmware update info missing");

    http.delete(UPDATE_URI).finally(() => {
      this.setState({
        firmwareUpdateState: null,
        firmwareUpdateInfo: null,
        reset: false,
      });
    });
  }
}
