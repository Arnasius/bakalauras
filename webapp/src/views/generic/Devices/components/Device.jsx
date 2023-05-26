import React, { useState, useEffect } from "react";
import { getDevice, getDeviceInfo } from "services/devices";
import { getGroup } from "services/groups";
import { Row, Col } from "reactstrap";
import SystemResources from "./SystemResources";
import ClientInformation from "./ClientInformation";
import MeshInfo from "./MeshInfo";
import DeviceRadios from "./radios/DeviceRadios";
import LinkField from "components/Links/LinkField";
import ThroughputStatistics from "views/generic/SystemInformation/components/graphs/ThroughputStatistics";
import StatusIndicator from "components/Tools/StatusIndicator";
import DeviceActionsPopover from "components/Tools/DeviceActionsPopover";

export default function Device(props) {
  const [device, setDevice] = useState({});
  const id = props.match.params.deviceId;
  const groupId = props.match.params.groupId;
  const [group, setGroup] = useState({});
  const [stats, setStats] = useState({});
  const [popoverOpen, togglePopover] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = props;

  const getData = () => {
    getDevice(groupId, id)
      .then((data) => {
        setDevice(data);
      })
      .catch((err) => console.error(err));
    getGroup(groupId)
      .then((data) => {
        setGroup(data);
      })
      .catch((err) => console.error(err));
    getDeviceInfo(props.currentOrganization, id, groupId)
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (currentOrganization) {
      getData();
    }
  }, [currentOrganization]);

  const returnStatusButton = (id, status) => {
    return (
      <div className="status device-status" id={"status_" + id}>
        <StatusIndicator
          target={"status_" + id}
          color={status ? "green" : "red"}
          message={status ? "Connected" : "Disconnected"}
          tooltipTarget={".device-status"}
        />
      </div>
    );
  };

  return device ? (
    <>
      <Row className="mb-3">
        <Col className="label">
          <div>
            <Row className="align-items-center">
              <Col xs="auto" className="pr-0">
                {returnStatusButton(device.deviceid, device.status)}
              </Col>
              <Col xs="auto">
                <h1 className="mb-0">{device?.devicename}</h1>
              </Col>
              <Col xs="auto" className="pl-0">
                <DeviceActionsPopover
                  id={"mesh-popover"}
                  togglePopover={() => togglePopover(!popoverOpen)}
                  popoverOpen={popoverOpen}
                  setDevice={setDevice}
                  device={device}
                  configLink={`${window.location.href}/edit`}
                  orgid={props.currentOrganization}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xs="auto">
                Assigned group:
                <LinkField
                  className="ml-1"
                  text={group.groupname}
                  to={{
                    pathname: `/groups/${groupId}/devices/`,
                    state: {},
                  }}
                />
              </Col>
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
              pathname: `/groups/${groupId}/devices/`,
              state: {},
            }}
          />
        </Col>
      </Row>
      <SystemResources
        cpuusage={stats?.cpuusage}
        totalmemory={stats?.totalmemory}
        usedmemory={stats?.usedmemory}
        device={device}
        setDevice={setDevice}
        uptime={stats?.uptime}
        group={group}
        groupid={groupId}
        loading={loading}
        loadData={getData}
        {...props}
      />
      <ClientInformation
        props={{ ...props, ...{ device: device } }}
        stats={stats}
        loading={loading}
        loadData={getData}
      />
      <Row>
        <Col>
          <MeshInfo
            mesh={{
              meshstatus: stats?.meshstatus,
              meshmode: stats?.meshmode,
              meshradio: stats?.meshradio,
              meship: stats?.meship,
              meshupstream: stats?.meshupstream,
            }}
            active={stats?.meshactive}
            loading={loading}
            loadData={getData}
            {...props}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <DeviceRadios
            radios={{
              radios: [
                {
                  radio: "wifi0",
                  mac: stats?.wifi0mac,
                  channel: stats?.wifi0channel,
                  channel_width: stats?.wifi0chwidth,
                  tx_power: stats?.wifi0txpower,
                },
                {
                  radio: "wifi1",
                  mac: stats?.wifi1mac,
                  channel: stats?.wifi1channel,
                  channel_width: stats?.wifi1chwidth,
                  tx_power: stats?.wifi1txpower,
                },
                {
                  radio: "wifi2",
                  mac: stats?.wifi2mac,
                  channel: stats?.wifi2channel,
                  channel_width: stats?.wifi2chwidth,
                  tx_power: stats?.wifi2txpower,
                },
              ],
            }}
            stats={stats}
            loading={loading}
          />
        </Col>
      </Row>
      <Row className="mb-1 label">
        <Col>Throughputs</Col>
      </Row>
      <Row>
        <Col>
          <ThroughputStatistics device={device} />
        </Col>
      </Row>
    </>
  ) : (
    <>
      <div className="mb-2 alert alert-warning">This device does not exist</div>
      <Row className="mt-2">
        <Col xs="auto">
          <LinkField
            button={true}
            type="button"
            title="Back"
            to={{
              pathname: props.location.backUrl
                ? props.location.backUrl
                : `/groups/`,
              state: {},
            }}
          />
        </Col>
      </Row>
    </>
  );
}
