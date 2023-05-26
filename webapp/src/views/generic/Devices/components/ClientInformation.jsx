import React, { useState } from "react";
import { Row, Col, Card, CardBody, TabContent, TabPane } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import {
  throughputRange,
  getDuration,
  bytesRange,
  radioLabels,
  secondsFromDate,
} from "services/text";
import CornerNav from "components/Tools/CornerNav";
import ClientCountStatistics from "views/generic/SystemInformation/components/graphs/ClientCountStatistics";
import CardWithLoading from "components/Cards/CardWithLoading";

function filterVaps(vaps) {
  let clientVaps = [];
  let connectionVaps = [];
  for (let vapIndex in vaps) {
    const mode = vaps[vapIndex].op_mode;
    if (mode == "sta" || mode == "master") {
      clientVaps.push(vaps[vapIndex]);
    } else if (mode == "ap" || mode == "client") {
      connectionVaps.push(vaps[vapIndex]);
    }
  }
  return { clientVaps: clientVaps, connectionVaps: connectionVaps };
}

function filterPeers(vaps) {
  let result = [];
  filterVaps(vaps);
  for (let vapIndex in vaps) {
    const vap = JSON.parse(JSON.stringify(vaps[vapIndex]));
    delete vap.peers;
    const peers = vaps[vapIndex].peers;
    for (let peerIndex in peers) {
      result.push({ ...peers[peerIndex], ...vap });
    }
  }
  return result;
}

function dataTable(data) {
  return (
    <DrawTable
      data={data}
      layout="fixed"
      columns={{
        MAC: { value: "mac", visibleOnTablet: true },
        Radio: {
          value: "radio",
          sortFormat: radioLabels,
          format: (data) => radioLabels(data.radio),
        },
        SSID: { value: "ssid" },
        Security: { value: "security" },
        Uptime: {
          value: "link_uptime",
          sortFormat: secondsFromDate,
          format: (data) => getDuration(data.link_uptime),
        },
        Signal: {
          value: "signal",
          sortFormat: parseFloat,
          format: (data) => `${data.signal} dBm`,
        },
        Uploading: {
          value: "tx_throughput",
          secondRow: true,
          format: (data) =>
            throughputRange(data?.tx_throughput * 1000000, "UpDown"),
        },
        Downloading: {
          value: "rx_throughput",
          secondRow: true,
          format: (data) =>
            throughputRange(data?.rx_throughput * 1000000, "UpDown"),
        },
        "Tx bytes": {
          value: "tx_bytes",
          secondRow: true,
          format: (data) => bytesRange(data.tx_bytes),
        },
        "Rx bytes": {
          value: "rx_bytes",
          secondRow: true,
          format: (data) => bytesRange(data?.rx_bytes),
        },
        "Tx rate": {
          value: "rx_rate",
          secondRow: true,
          format: (data) => `${data?.tx_rate?.toFixed(0)} Mbps`,
        },
        "Rx rate": {
          value: "tx_rate",
          secondRow: true,
          format: (data) => `${data?.rx_rate?.toFixed(0)} Mbps`,
        },
      }}
      collapsable
      search
      paginate
      sort
    />
  );
}

export default function ClientInformation({ stats, props, loading, loadData }) {
  let vaps = !stats ? [] : filterPeers(stats.vaps);
  let clientVaps = filterVaps(vaps).clientVaps;
  let connectionVaps = filterVaps(vaps).connectionVaps;
  const [currentTab, changeTab] = useState("Information");

  return (
    <>
      <Row>
        <Col>
          <CardWithLoading
            className={"iface-card"}
            loading={loading}
            loadData={loadData}
            cardHeader={
              <Row className="mb-0 label">
                <Col>Clients information</Col>
                <Col>
                  <CornerNav
                    xs="2"
                    currentTab={currentTab}
                    changeTab={changeTab}
                    tabs={[
                      { title: "Information", id: "Information" },
                      { title: "Statistics", id: "Statistics" },
                    ]}
                  />
                </Col>
              </Row>
            }
            body={
              <TabContent activeTab={currentTab}>
                <TabPane tabId="Information">
                  <Card>
                    <CardBody>{dataTable(clientVaps)}</CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId="Statistics">
                  <ClientCountStatistics device={props.device} />
                </TabPane>
              </TabContent>
            }
          />
        </Col>
      </Row>
      {connectionVaps.length != 0 ? (
        <>
          <Row className="mb-1 label">
            <Col>Connections</Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <CardBody>{dataTable(connectionVaps)}</CardBody>
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
    </>
  );
}
