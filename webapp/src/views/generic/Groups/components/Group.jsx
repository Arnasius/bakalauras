import React, { useState, useEffect } from "react";
import { getDevices } from "services/devices";
import { getGroup } from "services/groups";
import { Row, Col } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import LinkField from "components/Links/LinkField";
import Devices from "views/generic/Devices/components/Devices";
import GroupConfigPopover from "components/Tools/GroupConfigPopover";

export default function Group(props) {
  const [devices, setDevices] = useState([]);
  const [group, setGroup] = useState("");
  const id = props.match.params.groupId;
  const [popoverOpen, togglePopover] = useState(false);
  const [loading, setLoading] = useState(true);

  const getGroupDevices = () => {
    getDevices(id)
      .then((data) => {
        setDevices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (props.currentOrganization) {
      getGroup(id)
        .then((data) => {
          setGroup(data);
        })
        .catch((err) => console.error(err));
      getGroupDevices();
    }
  }, [props.currentOrganization]);

  return (
    <>
      <CardWithLoading
        id="group"
        loading={loading}
        loadData={getGroupDevices}
        header={
          <>
            <Row className="align-items-center">
              <Col xs="auto">
                <b>{group?.groupname} </b> devices
              </Col>
              <Col xs="auto" className="pl-0">
                <GroupConfigPopover
                  id={"popover"}
                  togglePopover={() => togglePopover(!popoverOpen)}
                  popoverOpen={popoverOpen}
                  groupid={id}
                  orgid={props.currentOrganization}
                />
              </Col>
              <Col xs="auto" className="ml-auto">
                <LinkField
                  button={true}
                  title="Back"
                  to={{
                    pathname: "/groups",
                    state: {},
                  }}
                />
              </Col>
              <Col xs="auto" className="d-none">
                <LinkField
                  className="mr-2 d-none"
                  button={true}
                  color="primary"
                  size="xs"
                  title="+ Add device"
                  to={{
                    pathname: `/groups/${id}/devices/add-device/`,
                    state: {},
                  }}
                />
              </Col>
            </Row>
          </>
        }
        body={
          <>
            <Row>
              <Col>
                <Devices
                  devices={devices}
                  groupId={id}
                  getData={getGroupDevices}
                  groupConfigSeq={group?.configseq}
                  props={props}
                />
              </Col>
            </Row>
          </>
        }
      />
    </>
  );
}
