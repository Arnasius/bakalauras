import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import RadioSettings from "./components/RadioSettings";

export default function WirelessSettingsPage({
  values,
  handleChange,
  config,
  setConfig,
  ...props
}) {
  return (
    <>
      <Row className="label mb-1">
        <Col>Wireless configuration</Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3">
            <CardBody className="row py-0">
              {values
                ? Object?.keys(values)?.map((radio, i) => {
                    return (
                      <RadioSettings
                        key={i}
                        {...props}
                        values={values}
                        handleChange={handleChange}
                        config={config}
                        setConfig={setConfig}
                        radio={radio}
                      />
                    );
                  })
                : null}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
