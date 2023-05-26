import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip } from "reactstrap";
import { getOrganizationDevices } from "services/devices";
import { getPrecentage } from "services/text";
import CardWithLoading from "components/Cards/CardWithLoading";

export default function SignalQuality(props) {
  const [healthyClients, setHealthyClients] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = props;

  const getData = () => {
    getOrganizationDevices()
      .then((result) => {
        const connectedClients = result.filter((client) => client.isconnected);

        let healthySum = 0;
        connectedClients.map((a) => {
          if (a.healthyclients) healthySum += a.healthyclients;
        });
        setHealthyClients(healthySum);

        let clientSum = 0;
        connectedClients.map((a) => {
          if (a.clientcount) clientSum += a.clientcount;
        });
        setClientCount(clientSum);
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

  return (
    <>
      <CardWithLoading
        className={"mb-3"}
        loading={loading}
        loadData={getData}
        header={"Signal quality"}
        body={
          <Row className="hide-on-hover">
            <Col className="text-center px-0">
              <div className="mt-2 mb-1">
                <div
                  className={`c100 center p${
                    Math.round(getPrecentage(clientCount, healthyClients)) || 0
                  }`}
                >
                  <span>
                    {Math.round(
                      getPrecentage(clientCount, healthyClients) * 100
                    ) / 100 || 0}
                    %
                  </span>
                  <div className="slice">
                    <div className="bar"></div>
                    <div className="fill"></div>
                  </div>
                </div>
              </div>
              <Row className="mt-2 mb-1">
                <Col xs="12">
                  <h2>{clientCount?.toString()} Clients</h2>
                </Col>
                <Col xs="12" id="healthy" className="label">
                  Healthy clients:
                  <div className="status d-inline-block ml-1">
                    {healthyClients.toString()}
                  </div>
                  <Tooltip
                    placement="bottom"
                    isOpen={isOpen}
                    target="healthy"
                    toggle={() => setIsOpen(!isOpen)}
                  >
                    {"RSSI better than -75 dBm"}
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          </Row>
        }
      />
    </>
  );
}
