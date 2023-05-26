import React, { useState, useEffect } from "react";
import { Row, Col, CardBody } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import StatusIndicator from "components/Tools/StatusIndicator";
import LinkField from "components/Links/LinkField";
import { getOrganizationDevices } from "services/devices";
import { sortableIp, secondsFromDate } from "services/text";
import Spinner from "components/Tools/Spinner";

export default function OrgDevices(props) {
  const [devices, setDevices] = useState([]);
  const { currentOrganization } = props;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrganizationDevices()
      .then((data) => {
        setDevices(data.filter((device) => device.isregistered));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentOrganization]);

  const returnOfflineOnlineCounter = (devices) => {
    let countOnline = 0;
    let countOffline = 0;
    for (let i = 0; i < devices.length; i++) {
      if (!devices[i].status) countOffline++;
      else countOnline++;
    }
    return (
      <Col>
        <Row>
          <Col xs="auto" className="d-flex">
            <div className="status d-inline-block mx-1">
              <div className="rounded-circle align-self-center green" />
            </div>
            {countOnline}
          </Col>
          <Col xs="auto" className="d-flex">
            <div className="status d-inline-block mx-1">
              <div className="rounded-circle red" />
            </div>
            {countOffline}
          </Col>
        </Row>
      </Col>
    );
  };

  const returnStatusButton = (id, status) => {
    return (
      <div className="status m-auto" id={"status_" + id}>
        <StatusIndicator
          target={"status_" + id}
          color={status ? "green" : "red"}
          message={status ? "Connected" : "Disconnected"}
        />
      </div>
    );
  };

  return (
    <>
      <CardBody>
        <Row>
          <Col xs="12">
            {loading ? (
              <Spinner className="center" />
            ) : (
              <DrawTable
                data={devices}
                extraInfo={() => returnOfflineOnlineCounter(devices)}
                columns={{
                  Status: {
                    width: "85px",
                    value: "heartbeat",
                    sortFormat: secondsFromDate,
                    ClassName: "text-right",
                    component: (data) =>
                      returnStatusButton(data.deviceid, data.status),
                  },
                  Name: {
                    value: "devicename",
                    component: (data) => (
                      <LinkField
                        to={{
                          pathname: `/groups/${data.groupid}/devices/${data.deviceid}`,
                          state: {},
                        }}
                        text={data.devicename}
                      />
                    ),
                    visibleOnTablet: true,
                  },
                  MAC: {
                    value: "devicemac",
                    component: (data) => (data.devicemac || "-").toUpperCase(),
                  },
                  Model: {
                    value: "board",
                    component: (data) => (data.board || "-").toUpperCase(),
                  },
                  IP: {
                    value: "ip_address",
                    sortFormat: sortableIp,
                    component: (data) =>
                      data.ip_address ? (
                        <a
                          href={`http://${data.ip_address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {data.ip_address}
                        </a>
                      ) : (
                        "-"
                      ),
                  },
                  Group: {
                    value: "groupname",
                    component: (data) => (
                      <LinkField
                        to={{
                          pathname: `/groups/${data.groupid}/devices/`,
                          state: {},
                        }}
                        text={data.groupname}
                      />
                    ),
                  },
                }}
                sort
                search
                paginate
                itemsPerPage={5}
              />
            )}
          </Col>
        </Row>
      </CardBody>
    </>
  );
}
