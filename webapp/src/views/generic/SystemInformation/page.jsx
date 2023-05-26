import React from "react";
import { Row, Col } from "reactstrap";
import OrgDevices from "./components/OrgDevices";
import ClientData from "./components/ClientData";
import SignalQuality from "./components/SignalQuality";
import OrganizationInfo from "./components/OrganizationInfo";

export function SystemInformationPage(props) {
  return (
    <>
      <Row>
        <Col xs="12">
          <OrganizationInfo {...props} />
        </Col>
      </Row>
      <Row>
        <Col xs="12" lg="4">
          <SignalQuality {...props} />
        </Col>
        <Col xs="12" lg="8">
          <ClientData {...props} />
        </Col>
      </Row>
      <Row>
        <Col xs="12" lg="12">
          <OrgDevices {...props} />
        </Col>
      </Row>
    </>
  );
}
