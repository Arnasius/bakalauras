import React, { Component } from "react";
import { Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";

import ConfigBackup from "components/Maintenance/ConfigBackup";
import ConfigRestore from "components/Maintenance/ConfigRestore";

export default class BackupModal extends Component {
  render() {
    return (
      <Modal isOpen={this.props.modalBackup} toggle={this.props.setModal}>
        <ModalHeader toggle={this.props.setModal}>
          Backup configuration
        </ModalHeader>
        <ModalBody>
          <Row className="btn-eq-width">
            <Col className="px-0">
              <Col>
                <ConfigBackup />
                <br />
                <ConfigRestore toggle={this.props.setModal} />
              </Col>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}
