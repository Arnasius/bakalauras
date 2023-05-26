import React, { useEffect, useState } from "react";
import { Row, Col, TabContent, TabPane } from "reactstrap";
import { bytesRange } from "services/text";
import CornerNav from "components/Tools/CornerNav";
import CpuMemoryStatistics from "views/generic/SystemInformation/components/graphs/CpuMemoryStatistics";
import DeviceInformation from "./DeviceInformation";
import CardWithLoading from "components/Cards/CardWithLoading";

export default function SystemResources(props) {
  const [stats, setStats] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    memoryTotal: 0,
  });
  const [currentTab, changeTab] = useState("information");
  const { loading, loadData } = props;

  useEffect(() => {
    if (
      props.cpuusage != undefined &&
      props.totalmemory != undefined &&
      props.usedmemory != undefined
    ) {
      setStats({
        cpuUsage: props.cpuusage,
        memoryUsage: parseInt(props.usedmemory),
        memoryTotal: parseInt(props.totalmemory),
      });
    }
  }, [props.cpuusage, props.totalmemory, props.usedmemory]);

  return (
    <>
      <Row>
        <Col>
          <CardWithLoading
            className={"iface-card"}
            loading={loading}
            loadData={loadData}
            cardHeader={
              <Row className="mb-0 label">
                <Col>Device {currentTab}</Col>
                <Col>
                  <CornerNav
                    xs="2"
                    currentTab={currentTab}
                    changeTab={changeTab}
                    tabs={[
                      { title: "Information", id: "information" },
                      { title: "Statistics", id: "statistics" },
                    ]}
                  />
                </Col>
              </Row>
            }
            body={
              <>
                <TabContent activeTab={currentTab}>
                  <TabPane tabId="information">
                    <Row className="align-items-center pt-2">
                      <Col xs="12" md="6">
                        <DeviceInformation
                          device={{
                            ...props.device,
                            ...{ uptime: props.uptime },
                          }}
                          props={props}
                        />
                      </Col>
                      <Col xs="12" md="6">
                        <Row className="hide-on-hover">
                          <Col
                            xs="12"
                            sm="6"
                            md="12"
                            xl="6"
                            className="text-center px-0"
                          >
                            <div className="mt-0 mb-1">
                              <div
                                className={`c100 center p${Math.round(
                                  stats.cpuUsage
                                )}`}
                              >
                                <span>{`${stats.cpuUsage}%`}</span>
                                <div className="slice">
                                  <div className="bar"></div>
                                  <div className="fill"></div>
                                </div>
                              </div>
                            </div>
                            <div className="mb-1">CPU</div>
                          </Col>
                          <Col
                            xs="12"
                            sm="6"
                            md="12"
                            xl="6"
                            className="text-center px-0"
                          >
                            <div className="mt-0 mb-1">
                              <div
                                className={`c100 center p${Math.round(
                                  (parseInt(
                                    bytesRange(stats.memoryUsage).replace(
                                      /[^\d.]/g,
                                      ""
                                    )
                                  ) /
                                    parseInt(
                                      bytesRange(stats.memoryTotal).replace(
                                        /[^\d.]/g,
                                        ""
                                      )
                                    )) *
                                    100
                                )}`}
                              >
                                <span className="h6 display-linebreak">
                                  {`${bytesRange(stats.memoryUsage, 0)} ${
                                    window.innerWidth <= 500 ? `\nof\n` : `/`
                                  } ${bytesRange(stats.memoryTotal, 0)}`}
                                </span>
                                <div className="slice">
                                  <div className="bar"></div>
                                  <div className="fill"></div>
                                </div>
                              </div>
                            </div>
                            <div>Memory</div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="statistics">
                    <CpuMemoryStatistics
                      device={props.device}
                      memoryTotal={stats.memoryTotal}
                    />
                  </TabPane>
                </TabContent>
              </>
            }
          />
        </Col>
      </Row>
    </>
  );
}
