import React from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import http from "services/http";
import alive from "services/alive";
import notify from "services/notify";
import { BlockControl } from "state/block";

const RESET_URI = "/cgi.lua/reset";

@BlockControl
export default class DeviceReset extends React.Component {
  constructor(props) {
    super(props);
    this.resetStart = this.resetStart.bind(this);
  }
  render() {
    return (
      <Modal isOpen={this.props.modalReset} toggle={this.props.setModal}>
        <ModalHeader toggle={this.props.setModal}>
          Reset to defaults
        </ModalHeader>
        <ModalBody>
          <big>Are you sure you want to reset the device to defaults?</big>
          <p>
            Device configuration will be reset to factory defaults and the
            device will automatically reboot.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.props.setModal}>
            No
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => {
              this.resetStart(), this.props.setModal();
            }}
          >
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  resetStart() {
    http.post(RESET_URI).then(
      () => {
        this.props.blockInfo(
          "Device is resetting to factory defaults. Please wait..."
        );
        alive.wait(60).then(
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
      () => {
        // TODO(edzius): update user notification verbosity
        notify.emit("error", "Device reset to factory defaults failed.");
      }
    );
  }
}
