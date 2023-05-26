import React, { Component } from "react";

import FirmwareUpdate from "components/Maintenance/FirmwareUpdate";
import { Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";

export default class Firmware extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.modalFirmware}
        toggle={() => this.props.setModal()}
      >
        <ModalHeader toggle={this.props.setModal}>Update firmware</ModalHeader>
        <ModalBody>
          <Row className="btn-eq-width">
            <Col className="px-0">
              <Col>
                <FirmwareUpdate />
              </Col>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}
