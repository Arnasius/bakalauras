import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Spinner from "components/Tools/Spinner";

export class DeleteModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.setLoadingState = this.setLoadingState.bind(this);
  }

  setLoadingState(loading) {
    this.setState({
      loading: loading,
    });
  }

  render() {
    const {
      modalOpen,
      closeModal,
      onDelete,
      message,
      error,
      confirmButtonName,
      header,
      confirmButtonColor,
    } = this.props;
    const { loading } = this.state;

    return (
      <Modal isOpen={modalOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          {header ? header : "Delete Confirmation!"}
        </ModalHeader>
        <ModalBody>
          <p>
            {" "}
            {message ? message : "Are you sure you want to delete the ..."}
          </p>
        </ModalBody>
        <ModalFooter>
          {loading ? (
            <Spinner className="px-0" />
          ) : (
            <Button
              color={confirmButtonColor ? confirmButtonColor : "danger"}
              disabled={loading}
              onClick={() => {
                this.setLoadingState(true);
                onDelete().finally(() => {
                  this.setLoadingState(false), closeModal();
                });
              }}
            >
              {confirmButtonName ? confirmButtonName : "Delete"}
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
