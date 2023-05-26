import React from "react";
import { Row, Col } from "reactstrap";
import Organizations from "./components/Organizations";

export function OrganizationPage(props) {
  return (
    <Row>
      <Col>
        <Organizations {...props} />
      </Col>
    </Row>
  );
}
