import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardTitle,
  CardHeader,
  CardBody,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import SsidCard from "./components/SsidCard";
import ButtonField from "components/Fields/ButtonField";

export default function SsidSettingsPage({
  config,
  setConfig,
  errors,
  values,
  ...props
}) {
  const [activeTab, setActiveTab] = useState("1");
  const [vaps, setVaps] = useState(values?.config?.ssids);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setVaps(values?.config?.ssids);
  }, [values?.config?.ssids]);

  useEffect(() => {
    if (vaps) {
      setConfig({
        ...config,
        config: { ...values.config, ssids: vaps },
      });
    }
  }, [count]);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const addNewSsid = () => {
    let ssids = vaps;

    ssids = ssids.concat({
      name: "SSID " + (ssids.length + 1),
      network_zone: "wan",
      radios: [],
      security: { mode: "Open", passphrase: "" },
    });

    setVaps(ssids);
    toggle(String(ssids.length));
    counter();
  };

  const counter = () => {
    setCount(count + 1);
  };

  const removeSsid = (ssidIndex) => {
    let ssids = vaps;
    ssids = ssids.filter(function (_value, index) {
      return index != ssidIndex;
    });
    setVaps(ssids);
    toggle(String("1"));
    counter();
  };

  return (
    <>
      <Row className="mb-1 label">
        <Col>SSID configuration</Col>
      </Row>
      <Card className="card-header-nav mb-3">
        <CardHeader className="m-0 p-0">
          <Nav tabs>
            {vaps?.sort().map((ssid, i) => {
              return (
                <NavItem key={i}>
                  <NavLink
                    className={classnames({
                      active: activeTab === String(i + 1),
                    })}
                    onClick={() => {
                      toggle(String(i + 1));
                    }}
                  >
                    {ssid.name === "" ? "No name" : ssid.name}
                  </NavLink>
                </NavItem>
              );
            })}
            {!props.disabled ? (
              <NavItem className="nav-button">
                <ButtonField
                  onClick={() => {
                    addNewSsid();
                  }}
                  disabled={
                    config?.config?.ssids?.length === 8 ||
                    config?.config?.mesh.enabled
                  }
                  tooltipMessage={
                    config?.config?.ssids?.length === 8
                      ? "Max number of SSIDs reached"
                      : config?.config?.mesh.enabled
                      ? "Only 1 SSID is allowed if mesh is enabled"
                      : null
                  }
                  tooltip={
                    config?.config?.ssids?.length === 8 ||
                    config?.config?.mesh.enabled
                  }
                  title={"Add new +"}
                  className={"ml-0"}
                />
              </NavItem>
            ) : null}
          </Nav>
        </CardHeader>
        <CardBody className="pt-0">
          <TabContent activeTab={activeTab}>
            {vaps?.sort().map((ssid, i) => {
              return (
                <TabPane key={i} tabId={String(i + 1)}>
                  <Row>
                    <Col>
                      <Card className="border-top-0">
                        <CardTitle>
                          <Row>
                            <Col>{ssid.name} </Col>
                            <Col xs="auto">
                              <ButtonField
                                id={ssid.name}
                                color="outlined"
                                size="xs"
                                title="Remove SSID"
                                onClick={() => {
                                  removeSsid(activeTab - 1);
                                }}
                                disabled={config?.config?.ssids?.length <= 1}
                              />
                            </Col>
                          </Row>
                        </CardTitle>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              );
            })}
            <SsidCard
              {...props}
              values={values}
              config={config}
              setConfig={setConfig}
              errors={errors}
              index={activeTab - 1}
            />
          </TabContent>
        </CardBody>
      </Card>
    </>
  );
}
