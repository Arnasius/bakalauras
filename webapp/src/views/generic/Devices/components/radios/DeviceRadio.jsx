import React from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { radioLabels, radioG } from "services/text";
import DrawTable from "components/DrawTable/DrawTable";

export default function DeviceRadio(props) {
  const { channel, channel_width, radio, tx_power } = props.radio;
  let vaps;
  let totalPeers = 0;
  if (props.stats?.vaps) {
    vaps = props.stats.vaps.filter((vap) => vap.radio === props.radio.radio);
    vaps.map((vap) => {
      if (Object.prototype.hasOwnProperty.call(vap, "peers")) {
        vap.peers.map((peer) => {
          if (
            Object.prototype.hasOwnProperty.call(peer, "mac") &&
            (vap.op_mode === "ap" || vap.op_mode === "master")
          ) {
            totalPeers++;
          }
        });
      }
    });
  }

  return (
    <>
      <Col xl="6">
        <Card className="iface-card">
          <CardHeader>
            <Row>
              <Col xs="auto" className="card-title pr-0 with-tooltip">
                <i className={"icon-" + radioG(radio)}>
                  <span className="iface-title m-1">
                    <span className="text-truncate m-0">
                      {radioLabels(radio)}
                    </span>
                  </span>
                </i>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Row className="mb-3">
              <Col md="6">
                <Row>
                  <div className="label label-fixed pr-0 col">Channel:</div>
                  <div className="borderless col">
                    {channel && channel_width
                      ? `${channel}, ${channel_width} MHz`
                      : "-"}
                  </div>
                </Row>
                <Row>
                  <Col className="label label-fixed pr-0">TxPower:</Col>
                  <Col className="borderless">
                    {tx_power ? tx_power + " dBm" : "-"}
                  </Col>
                </Row>
              </Col>
              <Col md="6">
                <Row>
                  <Col className="label label-fixed pr-0">Clients:</Col>
                  <Col className="borderless">{totalPeers}</Col>
                </Row>
              </Col>
            </Row>
            <Row className="table-description">
              <Col>Radio SSIDs: </Col>
            </Row>
            <DrawTable
              data={vaps}
              columns={{
                SSID: { value: "ssid", visibleOnTablet: true },
                Mode: {
                  value: "op_mode",
                  component: (data) =>
                    data?.op_mode === "master" || data?.op_mode === "ap"
                      ? "Access point"
                      : "Station",
                },
                Security: { value: "security" },
              }}
            />
          </CardBody>
        </Card>
      </Col>
    </>
  );
}
