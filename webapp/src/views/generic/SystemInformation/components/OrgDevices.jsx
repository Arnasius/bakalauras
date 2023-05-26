import React, { useState } from "react";
import { Row, Col, Card, CardHeader, TabContent, TabPane } from "reactstrap";
import CornerNav from "components/Tools/CornerNav";
import RegisteredOrgDevices from "./RegisteredOrgDevices";
import PendingOrgDevices from "./PendingOrgDevices";

export default function OrgDevices(props) {
  const [currentTab, changeTab] = useState("Registered");

  return (
    <>
      <Row>
        <Col>
          <Card className="iface-card">
            <CardHeader>
              <Row className="mb-0 label">
                <Col>{currentTab} devices</Col>
                <Col>
                  <CornerNav
                    xs="2"
                    currentTab={currentTab}
                    changeTab={changeTab}
                    tabs={[
                      { title: "Registered devices", id: "Registered" },
                      { title: "Pending devices", id: "Pending" },
                    ]}
                  />
                </Col>
              </Row>
            </CardHeader>
            <TabContent activeTab={currentTab}>
              <TabPane tabId="Registered">
                <RegisteredOrgDevices {...props} />
              </TabPane>
              <TabPane tabId="Pending">
                <PendingOrgDevices {...props} />
              </TabPane>
            </TabContent>
          </Card>
        </Col>
      </Row>
    </>
  );
}
