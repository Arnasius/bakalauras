import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
export function WarningModal({
  modalOpen,
  closeModal,
  message,
  onSave,
  valid,
  dirty,
  navigate,
  tooltipMessage,
}) {
  return (
    <Modal isOpen={modalOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}> Warning!</ModalHeader>
      <ModalBody>
        <p>
          {" "}
          {message
            ? message
            : "You have unsaved changes that will be lost if you leave this page."}
        </p>
      </ModalBody>
      <ModalFooter>
        <ButtonField
          title="Save &#38; leave"
          color="primary"
          type="submit"
          onClick={() => {
            onSave();
            navigate();
          }}
          tooltip={!valid && !!tooltipMessage}
          tooltipMessage={tooltipMessage}
          disabled={!dirty || !valid}
        />
        <ButtonField
          title="Discard &#38; leave"
          color="outlined"
          onClick={() => navigate()}
        />

        {!closeModal ? null : (
          <ButtonField color="outlined" title="Go back" onClick={closeModal} />
        )}
      </ModalFooter>
    </Modal>
  );
}
