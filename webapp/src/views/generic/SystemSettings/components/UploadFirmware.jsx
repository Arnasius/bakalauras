import React, { useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import GenericInputField from "components/Fields/GenericInputField";
import SelectField from "components/Fields/SelectField";
import ButtonField from "components/Fields/ButtonField";
import { Button } from "reactstrap";

export default function UploadFirmware({ name }) {
  const [state, setState] = useState({
    name: "",
    filename: "",
    model: "mi10",
    step: 1,
    uploaded: false,
  });

  const boardOptions = [
    { value: "mi10", name: "MI10" },
    { value: "mo10", name: "M010" },
  ];

  const [fileName, setFileName] = useState("");
  const hiddenFileInput = React.useRef(null);

  const handleFileChange = (event) => {
    setFileName(event.target.files[0].name);

    const formData = new FormData();
    formData.append(
      "name",
      state.name ? state.name : event.target.files[0].name
    );
    formData.append("model", state.model);
    formData.append("filename", event.target.files[0].name);
    formData.append("file", event.target.files[0]);

    fetch("/api/server/firmwares", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    })
      .then((success) => {
        setState({ ...state, uploaded: true });
        console.info("Success:");
        console.info(success);
      })
      .catch((error) => {
        console.info("Error:");
        console.error(error);
      });
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleChange = (key, value) => {
    setState({ ...state, [key]: value });
  };

  const nextStep = (step) => {
    setState({ ...state, step: step });
  };

  return (
    <>
      <Row className="label">
        <Col>{name}</Col>
      </Row>
      <Card>
        <CardBody>
          {state.step == 1 ? (
            <Row className="mb-3">
              <Col md="6">
                <GenericInputField
                  name="name"
                  label="Name"
                  onChange={(event) =>
                    handleChange(event.target.name, event.target.value)
                  }
                />
                <SelectField
                  name="model"
                  label="Model"
                  options={boardOptions}
                  onChange={(event) =>
                    handleChange(event.target.name, event.target.value)
                  }
                />
              </Col>
            </Row>
          ) : (
            <Row className="label">
              {state.uploaded ? (
                <Col xs="12">
                  <div className="alert alert-info mb-0">
                    Firmware file uploaded successfully.
                    <ButtonField
                      title="Bact to settings"
                      color="primary"
                      className="ml-2"
                      href="/#/settings"
                    />
                  </div>
                </Col>
              ) : (
                <>
                  <Col xs="12" className="mb-3">
                    Select firmware file:
                  </Col>
                  <Col xs="auto" className="pr-0">
                    {fileName == "" ? (
                      <>
                        <Button color="primary" onClick={handleClick}>
                          Upload file
                        </Button>
                        <input
                          type="file"
                          ref={hiddenFileInput}
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </>
                    ) : (
                      <label>Uploading file: {fileName}. Please wait.</label>
                    )}
                  </Col>
                  {fileName == "" ? (
                    <Col xs="auto">
                      <ButtonField title="Back" onClick={() => nextStep(1)} />
                    </Col>
                  ) : null}
                </>
              )}
            </Row>
          )}

          {state.step == 1 ? (
            <Row>
              <Col xs="auto" className="pr-0">
                <ButtonField title="Cancel" href="/#/settings" />
              </Col>
              <Col xs="auto" className="pr-0">
                <ButtonField
                  title="Next"
                  color="primary"
                  onClick={() => nextStep(2)}
                />
              </Col>
            </Row>
          ) : null}
        </CardBody>
      </Card>
    </>
  );
}
