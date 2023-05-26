import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import SwitchField from "components/Fields/SwitchField";
import SelectField from "components/Fields/SelectField";
import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import ConfigCardHeader from "components/Cards/ConfigCardHeader";

export default function MeshSettings({
  values,
  handleChange,
  errors,
  zones,
  disabled,
  config,
}) {
  let radios;
  let disabledRadios = availableRadios.filter(
    (radio) => !config.config.ssids[0].radios.includes(radio)
  );
  //if first ssid has only 1 radio enabled
  //mesh backhaul radio choice has to be limited
  //so that we would ensure 1 enabled radio at first ssid
  //when mesh is enabled
  if (config.config.ssids[0].radios.length < 2) {
    radios = defaultRadios.filter((radio) =>
      disabledRadios.includes(radio.value)
    );
  } else {
    radios = defaultRadios;
  }

  return (
    <>
      <Row className="mb-1 label">
        <Col>Mesh configuration</Col>
      </Row>
      <Card className="mb-3 card--short">
        <ConfigCardHeader
          showSwitch={disabled ? false : true}
          onChange={handleChange}
          label={values?.enabled ? "Enabled" : "Disabled"}
          enabled={values?.enabled || false}
          switchFieldName={"config.mesh.enabled"}
          tooltipTarget={".configMeshEnabled"}
          switchDisabled={
            config.config.ssids.length > 1
              ? true
              : config.config.ssids[0].radios.length === 0
              ? true
              : false
          }
          switchDisabledMessage={
            config.config.ssids.length > 1
              ? "Mesh can be enabled with only 1 SSID"
              : "Mesh requires at least 1 SSID radio enabled"
          }
        />
        {values?.enabled ? (
          <CardBody>
            <Row className="">
              <Col>
                <SelectField
                  name="config.mesh.network_zone"
                  label="Network zone"
                  value={values?.network_zone || "wan"}
                  onChange={handleChange}
                  options={zones}
                  disabled={disabled}
                />
                <Row>
                  <Col>
                    <div className="alert alert-info mb-2 mt-1 w-100">
                      Only those SSIDs that are added to the selected network
                      zone will be a part of the Mesh
                    </div>
                  </Col>
                </Row>

                {radios.length ? (
                  <SelectField
                    name="config.mesh.backhaul.radio"
                    label="Backhaul radio"
                    //value can be selected ONLY if it is NOT the only one enabled at ssid
                    value={
                      config.config.ssids[0].radios.length === 1 &&
                      config.config.ssids[0].radios[0] ===
                        config.config.mesh.backhaul.radio
                        ? ""
                        : values?.backhaul?.radio
                    }
                    onChange={handleChange}
                    options={radios}
                    disabled={disabled}
                  />
                ) : (
                  <div className="alert alert-info">
                    At least one enabled radio is required. Please enable a
                    radio first before changing mesh settings.
                  </div>
                )}
                <>
                  <GenericInputField
                    name="config.mesh.backhaul.ssid"
                    label="Backhaul SSID"
                    value={values?.backhaul?.ssid}
                    onChange={handleChange}
                    validate={errors.mesh_ssid}
                    disabled={disabled}
                  />
                  <SecretField
                    name="config.mesh.backhaul.passphrase"
                    label="Backhaul passphrase"
                    value={values?.backhaul?.passphrase}
                    onChange={handleChange}
                    validate={errors.mesh_passphrase}
                    disabled={disabled}
                  />
                </>

                <GenericInputField
                  name="config.mesh.id"
                  label="Network ID"
                  value={values?.id}
                  onChange={handleChange}
                  validate={errors.mesh_id}
                  disabled={disabled}
                />

                <SwitchField
                  id="redundancy"
                  name="config.mesh.redundancy"
                  checked={values?.redundancy || false}
                  label="Gateway redundancy"
                  onChange={handleChange}
                  tooltip={true}
                  tooltipMessage="Gateway redundancy is an automatic detection mechanism, that detects if device has plugged in cable and has alternative way for internet access. Either Wi-Fi or Ethernet backhaul is supported, never both at the same time. If the Ethernet link goes away, it brings wifi-backhaul up again."
                  disabled={disabled}
                />
              </Col>
            </Row>
          </CardBody>
        ) : null}
      </Card>
    </>
  );
}

let defaultRadios = [
  { value: "wifi0", name: "5GHz radio (IPQ6018)" },
  { value: "wifi2", name: "5GHz radio (QCN9024)" },
];

const availableRadios = ["wifi0", "wifi2"];
