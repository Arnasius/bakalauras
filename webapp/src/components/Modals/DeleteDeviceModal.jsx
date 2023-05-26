import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Spinner from "components/Tools/Spinner";
import Checkbox from "components/Fields/Checkbox";
import { deleteDevice } from "services/devices";

export class DeleteDeviceModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setLoadingState = this.setLoadingState.bind(this);
    this.state = {
      loading: false,
    };
  }

  setLoadingState(loading) {
    this.setState({
      ...this.state,
      loading: loading,
    });
  }

  handleInputChange(e) {
    this.setState({ ...this.state, [e.target.name]: e.target.checked });
  }

  render() {
    const {
      modalOpen,
      closeModal,
      message,
      deviceId,
      resetConfig,
      deviceMac,
      deviceStatus,
      getData,
      error,
    } = this.props;

    const { loading } = this.state;

    return (
      <Modal isOpen={modalOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Delete Confirmation!</ModalHeader>
        <ModalBody>
          <p>
            {" "}
            {message ? message : "Are you sure you want to delete the device?"}
          </p>{" "}
          <Checkbox
            name={"resetConfig"}
            label={"Reset to factory defaults"}
            value={resetConfig}
            checked={resetConfig}
            disabled={!deviceStatus}
            tooltip={!deviceStatus}
            tooltipMessage={"Device must be connected"}
            onChange={this.handleInputChange}
          />
        </ModalBody>
        <ModalFooter>
          {loading ? (
            <Spinner className="px-0" />
          ) : (
            <Button
              color="danger"
              disabled={loading}
              onClick={() => {
                this.setLoadingState(true);
                deleteDevice(deviceId, this.state?.resetConfig, deviceMac)
                  .then(getData)
                  .catch((err) => {
                    console.error(err);
                  })
                  .finally(() => {
                    this.setLoadingState(false), closeModal();
                  });
              }}
            >
              Delete
            </Button>
          )}

          {!closeModal ? null : (
            <Button color="outlined" onClick={closeModal}>
              Cancel
            </Button>
          )}
        </ModalFooter>
        {error && (
          <p className="error-message pt-3 d-flex justify-content-end">
            {" "}
            {error}{" "}
          </p>
        )}
      </Modal>
    );
  }
}
