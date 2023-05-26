import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import GenericInputField from "components/Fields/GenericInputField";

export default function GroupInfo({ values, handleChange, errors, disabled }) {
  return (
    <>
      <Row className="mb-1 label">
        <Col>Group info</Col>
      </Row>
      <Card className="mb-3 card--short">
        <CardBody>
          <Row>
            <Col>
              <GenericInputField
                label="Name"
                name="groupname"
                value={values?.groupname || ""}
                validate={errors.groupname}
                onChange={handleChange}
                disabled={disabled}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <GenericInputField
                label="Description"
                name="description"
                value={values?.description || ""}
                validate={errors.description}
                onChange={handleChange}
                disabled={disabled}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
}
