import React, { useState, useEffect } from "react";
import { Row, Col } from "reactstrap";
import { getOrganizationDevices } from "services/devices";
import { bytesRange, throughputRange } from "services/text";
import CardWithLoading from "components/Cards/CardWithLoading";

export default function ClientData(props) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = props;

  const getData = () => {
    getOrganizationDevices()
      .then((rezult) => {
        setData({
          clientrxbytes: rezult
            .map((a) => (a.clientrxbytes ? parseInt(a.clientrxbytes) : 0))
            .reduce((a, b) => a + b, 0),
          clienttxbytes: rezult
            .map((a) => (a.clienttxbytes ? parseInt(a.clienttxbytes) : 0))
            .reduce((a, b) => a + b, 0),
          clientthroughputrx: rezult
            .map((a) =>
              a.clientthroughputrx ? parseInt(a.clientthroughputrx) : 0
            )
            .reduce((a, b) => a + b, 0),
          clientthroughputtx: rezult
            .map((a) =>
              a.clientthroughputtx ? parseInt(a.clientthroughputtx) : 0
            )
            .reduce((a, b) => a + b, 0),
        });
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
        header={"Client Throughput"}
        body={
          <Row className="align-items-end">
            <Col md="6" className="mb-2">
              <Row>
                <Col className="label mb-2">Total current upload</Col>
              </Row>
              <Row>
                <Col xs="auto">
                  <div className="icon-container d-flex justify-content-center align-items-center">
                    <span className="now-ui-icons arrows-1_minimal-up" />
                  </div>
                </Col>
                <Col xs="auto" className="text-throuput-data">
                  <h5>{throughputRange(data.clientthroughputtx)}</h5>
                </Col>
              </Row>
            </Col>
            <Col md="6" className="mb-2">
              <Row>
                <Col className="label mb-2">Total current download</Col>
              </Row>
              <Row>
                <Col xs="auto">
                  <div className="icon-container d-flex justify-content-center align-items-center">
                    <span className="now-ui-icons arrows-1_minimal-down" />
                  </div>
                </Col>
                <Col xs="auto" className="text-throuput-data">
                  <h5>{throughputRange(data.clientthroughputrx)}</h5>
                </Col>
              </Row>
            </Col>
            <Col md="6" className="mt-2">
              <Row>
                <Col className="label mb-2">Total data uploaded</Col>
              </Row>
              <Row>
                <Col xs="auto">
                  <div className="icon-container d-flex justify-content-center align-items-center">
                    <span className="now-ui-icons arrows-1_minimal-up" />
                  </div>
                </Col>
                <Col xs="auto" className="text-throuput-data">
                  <h5>{bytesRange(data.clienttxbytes)}</h5>
                </Col>
              </Row>
            </Col>
            <Col md="6" className="mt-2">
              <Row>
                <Col className="label mb-2">Total data downloaded</Col>
              </Row>
              <Row>
                <Col xs="auto">
                  <div className="icon-container d-flex justify-content-center align-items-center">
                    <span className="now-ui-icons arrows-1_minimal-down" />
                  </div>
                </Col>
                <Col xs="auto" className="text-throuput-data">
                  <h5>{bytesRange(data.clientrxbytes)}</h5>
                </Col>
              </Row>
            </Col>
          </Row>
        }
      />
    </>
  );
}
