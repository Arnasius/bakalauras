import React, { Component } from "react";
import { Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";

export default class DisconnectModal extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        className="modal-dialog modal-dialog-centered"
      >
        <ModalHeader>Warning!</ModalHeader>
        <ModalBody>
          <Row className="btn-eq-width">
            <Col className="px-0">
              <Col>
                The server is unreachable. Please check your connection and
                reload page.
              </Col>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}
