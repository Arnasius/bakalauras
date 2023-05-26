import React from "react";
import { Row, Col } from "reactstrap";
import { getDuration } from "services/text";
import { Badge } from "reactstrap";

function returnTime(heartbeat) {
  let currentDate = new Date();
  return Math.floor(
    (currentDate.getTime() - Date.parse(new Date(heartbeat))) / 60000
  );
}

export default function DeviceInformation({ device, props }) {
  const returnLastSeen = (heartbeat) => {
    const time = returnTime(heartbeat);
    let lastSeen = "";

    if (time < 60 && time > 3) lastSeen = time + " minutes ago";
    else if (time >= 60 && time < 1440)
      lastSeen = Math.floor(time / 60) + ` hour${time < 120 ? "" : "s"} ago`;
    else if (time >= 1440)
      lastSeen = Math.floor(time / 1440) + ` day${time < 2880 ? "" : "s"} ago`;
    return lastSeen;
  };

  return (
    <>
      <Row>
        <Col md="4" className="label">
          MAC address:
        </Col>
        <Col>{device.devicemac?.toUpperCase()}</Col>
      </Row>
      <Row>
        <Col md="4" className="label">
          Model:
        </Col>
        <Col>{device.board?.toUpperCase()}</Col>
      </Row>
      <Row>
        <Col md="4" className="label">
          IP address:
        </Col>
        <Col>
          {device.ip_address ? (
            <a
              href={`http://${device.ip_address}`}
              target="_blank"
              rel="noreferrer"
            >
              {device.ip_address}
            </a>
          ) : (
            "Not connected"
          )}
        </Col>
      </Row>
      <Row>
        <Col md="4" className="label">
          Firmware version:
        </Col>
        <Col>{device.fwversion}</Col>
      </Row>
      <Row>
        <Col md="4" className="label">
          Mesh mode:
        </Col>
        <Col>{device.meshmode?.toUpperCase()}</Col>
      </Row>
      <Row>
        <Col md="4" className="label">
          Configuration:
        </Col>
        <Col>
          {device.configseq !== props.group.configseq ? (
            <Badge
              className="badge-big"
              href={`#/organizations/${props.currentOrganization}/groups/${props.groupid}/view/devices/${device.deviceid}`}
              pill
              color="warning"
            >
              Updating
            </Badge>
          ) : (
            <Badge className="badge-big" pill color="primary">
              Up to date
            </Badge>
          )}
        </Col>
      </Row>
      {device.firmware_status !== null ? (
        <Row>
          <Col md="4" className="label">
            Firmware upgrade status:
          </Col>
          <Col>
            {device.firmware_status == "upgraded" ||
            device.firmware_status == "started" ||
            device.firmware_status == "downloading" ||
            device.firmware_status == "writing" ||
            device.firmware_status == "switching" ? (
              <Badge
                className="badge-big badge-firmware-status"
                pill
                color="primary"
                href={`#/organizations/${props.currentOrganization}/groups/${props.groupid}/devices/${device.deviceid}/upgrade`}
              >
                {device.firmware_status}
              </Badge>
            ) : (
              <Badge
                className="badge-big badge-firmware-status"
                pill
                color="warning"
                href={`#/organizations/${props.currentOrganization}/groups/${props.groupid}/devices/${device.deviceid}/upgrade`}
              >
                Up to date
              </Badge>
            )}
          </Col>
        </Row>
      ) : null}
      {returnTime(device?.heartbeat) > 5 ? (
        <Row>
          <Col md="4" className="label">
            Last seen:
          </Col>
          <Col>{returnLastSeen(device?.heartbeat)}</Col>
        </Row>
      ) : (
        <Row>
          <Col md="4" className="label">
            Uptime:
          </Col>
          <Col>{getDuration(device?.uptime)}</Col>
        </Row>
      )}
    </>
  );
}
