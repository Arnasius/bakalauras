import React from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import http from "services/http";
import alive from "services/alive";
import notify from "services/notify";
import { BlockControl } from "state/block";

const REBOOT_URI = "/cgi.lua/reboot";

@BlockControl
export default class DeviceReboot extends React.Component {
  constructor(props) {
    super(props);

    this.rebootStart = this.rebootStart.bind(this);
  }
  render() {
    return (
      <Modal isOpen={this.props.modalReboot} toggle={this.props.setModal}>
        <ModalHeader toggle={this.props.setModal}>Reboot device</ModalHeader>
        <ModalBody>{"Are you sure you want to reboot the device?"}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.props.setModal}>
            No
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => {
              this.rebootStart(), this.props.setModal();
            }}
          >
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  rebootStart() {
    http.post(REBOOT_URI).then(
      () => {
        this.props.blockInfo("Device is rebooting. Please wait...");
        alive.wait(60).then(
          () => {
            this.props.blockOff();
            alive.reload();
          },
          () => {
            this.props.blockFail(
              "Could not reconnect to the device. Please check your network configuration and reload this page."
            );
          }
        );
      },
      () => {
        // TODO(edzius): update user notification verbosity
        notify.emit("error", "Device reboot failed.");
      }
    );
  }
}
