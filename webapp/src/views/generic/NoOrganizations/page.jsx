import React from "react";
import { Row, Col } from "reactstrap";

export function NoOrganizations() {
  return (
    <>
      <Row className="label">
        <Col>Dashboard</Col>
      </Row>
      <Row>
        <Col>
          {
            "You don't have any organizations. Please contact your organization administrator."
          }
        </Col>
      </Row>
    </>
  );
}
