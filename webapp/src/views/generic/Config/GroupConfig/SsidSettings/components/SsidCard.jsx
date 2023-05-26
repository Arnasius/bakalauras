import React from "react";
import { radioLabels } from "services/text";
import { Row, Col } from "reactstrap";
import SwitchField from "components/Fields/SwitchField";
import SelectField from "components/Fields/SelectField";
import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";

export default function SsidCard({
  index,
  errors,
  zones,
  values,
  handleChange,
  disabled,
}) {
  let disableRadioSwitch;
  if (values.config.mesh.enabled) {
    const firstSsidRadiosCount = values.config.ssids[0].radios.filter(
      (radio) => radio != values.config.mesh.backhaul.radio
    ).length;
    disableRadioSwitch = firstSsidRadiosCount < 2;
  }

  return (
    <>
      <Row>
        <Col xs="6">
          <Row>
            <Col>
              <GenericInputField
                name={`config.ssids[${index}].name`}
                label="SSID"
                value={values.config.ssids[index]?.name || ""}
                onChange={handleChange}
                validate={
                  errors?.["ssid_" + values.config.ssids[index]?.name + "_name"]
                }
                disabled={disabled}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <SelectField
                name={`config.ssids[${index}].network_zone`}
                label="Network zone"
                options={zones}
                value={values.config.ssids[index]?.network_zone || "wan"}
                onChange={handleChange}
                disabled={disabled}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="label">Enabled on radios:</Col>
          </Row>
          {radios.map((radio, i) => {
            if (
              !(
                values.config?.mesh?.enabled &&
                radio === values.config?.mesh?.backhaul?.radio
              )
            ) {
              return (
                <Row key={i} className="mt-2">
                  <Col className="d-flex">
                    <SwitchField
                      id={radio + index}
                      className={radio + index}
                      name={`config.ssids[${index}].radios`}
                      label={radioLabels(radio)}
                      value={radio || ""}
                      checked={
                        values.config.ssids[index]?.radios?.includes(radio) ||
                        false
                      }
                      onChange={handleChange}
                      disabled={
                        disabled ||
                        (disableRadioSwitch &&
                          values.config.ssids[index]?.radios?.includes(radio))
                      }
                      tooltip={
                        disableRadioSwitch &&
                        values.config.ssids[index]?.radios?.includes(radio)
                      }
                      tooltipTarget={"." + radio + index}
                      tooltipMessage={"At least 1 radio must be enabled"}
                    />
                  </Col>
                </Row>
              );
            }
          })}
        </Col>
        <Col xs="6">
          <Row>
            <Col>
              <SelectField
                name={`config.ssids[${index}].security.mode`}
                label="Security mode"
                options={securityOptions}
                value={
                  values?.config?.ssids[index]?.security.mode || "WPA2 PSK"
                }
                onChange={handleChange}
                disabled={disabled}
              />
            </Col>
          </Row>
          {values?.config?.ssids?.[index]?.security?.mode == "Open" ? null : (
            <Row className="mt-2">
              <Col>
                <SecretField
                  name={`config.ssids[${index}].security.passphrase`}
                  label="Passphrase"
                  value={
                    values?.config?.ssids?.[index]?.security?.passphrase || ""
                  }
                  onChange={handleChange}
                  validate={
                    errors?.[
                      "ssid_" + values.config.ssids[index]?.name + "_passphrase"
                    ]
                  }
                  disabled={disabled}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </>
  );
}

const securityOptions = [
  { value: "Open", name: "Open" },
  { value: "WPA2 PSK", name: "WPA2" },
  { value: "WPA3 PSK", name: "WPA3" },
  { value: "WPA2+WPA3 PSK", name: "WPA2 + WPA3" },
];

const radios = ["wifi0", "wifi1", "wifi2"];
