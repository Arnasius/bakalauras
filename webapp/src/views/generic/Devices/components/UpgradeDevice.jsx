import React, { useState, useEffect } from "react";
import { getDevice } from "services/devices";
import { Row, Col } from "reactstrap";
import LinkField from "components/Links/LinkField";
import FirmwaresTable from "views/generic/SystemSettings/components/FirmwaresTable";

export default function UpgradeDevice(props) {
  const [device, setDevice] = useState({});
  const id = props.match.params.deviceId;
  const groupId = props.match.params.groupId;

  useEffect(() => {
    if (props.currentOrganization) {
      getDevice(groupId, id)
        .then((data) => {
          setDevice(data);
        })
        .catch((err) => console.error(err));
    }
  }, [props.currentOrganization]);

  let allowFirmwareUpgrade =
    (device.firmware_status == null ||
      device.firmware_status == "download_failed" ||
      device.firmware_status == "write_failed" ||
      device.firmware_status == "switch_failed" ||
      device.firmware_status == "upgraded") &&
    device.status
      ? true
      : false;

  let upgradeStatus = "Device firmware ugprade has started";

  if (device.firmware_status == "downloading")
    upgradeStatus = "Device is downloading the firmware";
  if (device.firmware_status == "writing")
    upgradeStatus = "Device is writing the firmware to flash";
  if (device.firmware_status == "switching")
    upgradeStatus = "Device is rebooting into the new firmware";

  const firmwareAlertMessage = device.status
    ? `Firmware upgrade in progress. ${upgradeStatus}`
    : "Device is disconected. Firmware update is not available.";

  if (device.firmware_updated_time && !allowFirmwareUpgrade && device.status) {
    const deviceUpgradeTime = new Date(device.firmware_updated_time);
    const currentTime = new Date();
    const minutesPassed =
      (currentTime.getTime() - deviceUpgradeTime.getTime()) / 1000 / 60;

    if (minutesPassed > 10) allowFirmwareUpgrade = true;
  }

  return (
    <>
      <Row className="mb-3">
        <Col className="label">
          <div>
            <Row className="align-items-center">
              <Col xs="auto">
                <h1 className="mb-0">Device: {device?.devicename}</h1>
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xs="auto">Current firmware: {device?.fwversion}</Col>
            </Row>
          </div>
        </Col>
        <Col xs="auto">
          <LinkField
            button={true}
            color="secondary"
            className="ml-2"
            title="Back"
            to={{
              pathname: props.location.backUrl
                ? props.location.backUrl
                : `/groups/${groupId}/devices/`,
              state: {},
            }}
          />
        </Col>
      </Row>
      {allowFirmwareUpgrade ? (
        <FirmwaresTable device={device} />
      ) : (
        <Row>
          <Col>
            <div className="alert alert-warning mb-0">
              {firmwareAlertMessage}
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}
