import React from "react";
import { Button } from "reactstrap";

import http from "services/http";
import alive from "services/alive";
import config from "services/config";
import notify from "services/notify";
import { BlockControl } from "state/block";

import Spinner from "components/Tools/Spinner";

const SNAPSHOT_URI = "/cgi.lua/snapshot";
const CONFIG_URI = "/cgi.lua/config";

@BlockControl
export default class ConfigRestore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configRestoreState: null,
      configRestoreData: null,
    };

    this.uploadFile = this.uploadFile.bind(this);
    this.applyConfig = this.applyConfig.bind(this);
    this.resetConfig = this.resetConfig.bind(this);
    this.activateUpload = this.activateUpload.bind(this);
  }

  render() {
    const { configRestoreState, configRestoreData } = this.state;

    return (
      <div>
        <div>Import system settings</div>
        <p className="description">
          Restore the device configuration from a backup file:
        </p>
        {!configRestoreData ? (
          <div>
            <Button
              color="primary"
              onClick={
                configRestoreState ? this.props.toggle : this.activateUpload
              }
            >
              {configRestoreState === true ? (
                <>
                  <i className="now-ui-icons ui-1_check" /> Restored
                </>
              ) : null}
              {configRestoreState === "wait" ? (
                <Spinner className="p-0" />
              ) : null}
              {configRestoreState ? null : "Upload file"}
            </Button>
            <input
              className="hidden"
              type="file"
              name=""
              id="file-input"
              ref={(ref) => (this.fileInput = ref)}
              onChange={this.uploadFile}
            />
          </div>
        ) : (
          <>
            <Button color="primary" onClick={this.applyConfig}>
              Apply
            </Button>
            <Button color="secondary" onClick={this.resetConfig}>
              Cancel
            </Button>
          </>
        )}
      </div>
    );
  }

  activateUpload() {
    var object = this.fileInput;
    object.click();
  }

  uploadFile(event) {
    const file = event.target.files[0];
    if (file.size > 64000) {
      this.setState({
        configRestoreState: false,
      });
      notify.emit("error", "Invalid configuration backup file.");
      return;
    }

    const formData = new FormData();
    formData.append("cfg", event.target.files[0]);

    http.post(SNAPSHOT_URI, formData).then(
      (result) => {
        this.setState({
          configRestoreState: true,
          configRestoreData: result,
        });
      },
      (reason) => {
        this.setState({
          configRestoreState: false,
        });
        console.error(reason);
        // TODO(edzius): update user notification verbosity
        notify.emit("error", "Configuration backup upload failed.");
      }
    );
  }

  applyConfig() {
    if (!this.state.configRestoreData)
      throw new Error("BUG: config data missing");

    config.set(this.state.configRestoreData, true);
    this.setState({
      configRestoreData: null,
      configRestoreState: "wait",
    });

    config
      .apply()
      .then((result) => {
        return (result && result.reload) || {};
      })
      .then((reload) => {
        this.props.blockInfo("Restoring configuration. Please wait...");
        return alive.verify(reload.recovery).then(
          (redirect) => {
            this.props.blockOff();
            notify.emit("success", "Configuration applied successfully.");
            redirect ? alive.redirect(reload.recovery.newAddress) : null;
            this.setState({
              configRestoreState: true,
            });
            return reload;
          },
          () => {
            this.props.blockFail(
              "Cannot re-connect to device. Please check network configuration and reload page."
            );
            notify.emit("error", "Configuration apply failed.");
            setTimeout(() => {
              this.props.blockOff();
            }, 3000);
            this.setState({
              configRestoreState: false,
            });
            return alive.preserve();
          }
        );
      });
  }

  resetConfig() {
    if (!this.state.configRestoreData)
      throw new Error("BUG: config data missing");

    http.delete(CONFIG_URI).finally(() => {
      this.setState({
        configRestoreState: null,
        configRestoreData: null,
      });
    });
  }
}
