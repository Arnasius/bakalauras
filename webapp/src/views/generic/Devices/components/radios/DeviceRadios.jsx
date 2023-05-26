import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import DeviceRadio from "./DeviceRadio";
import Spinner from "components/Tools/Spinner";

export default function DeviceRadios({ radios, stats, loading }) {
  return (
    <>
      <Row className="mb-1 label">
        <Col>Radios information</Col>
      </Row>
      {loading ? (
        <Card className="mb-3">
          <CardBody>
            <Spinner className="center" />
          </CardBody>
        </Card>
      ) : (
        <>
          {stats ? (
            <Row>
              {radios.radios.map((radio, i) => {
                return <DeviceRadio stats={stats} key={i} radio={radio} />;
              })}
            </Row>
          ) : (
            <Card className="mb-3">
              <CardBody>
                <Row>
                  <Col>No radios data</Col>
                </Row>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </>
  );
}
