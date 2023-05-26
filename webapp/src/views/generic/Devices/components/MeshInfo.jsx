import React from "react";
import { Row, Col } from "reactstrap";
import { radioLabels, returnLabel } from "services/text";
import StatusIndicator from "components/Tools/StatusIndicator";
import LinkField from "components/Links/LinkField";
import { BsFillGearFill } from "react-icons/bs";
import CardWithLoading from "components/Cards/CardWithLoading";

export default function MeshInfo({ mesh, loading, loadData, ...props }) {
  const id = props.match.params.deviceId;
  const groupid = props.match.params.groupId;

  const returnStatusButton = (status) => {
    {
      let color = "";
      let message = "";

      if (status == "disconnected") {
        color = "red";
        message = "Disconnected";
      } else if (status == "connected") {
        color = "green";
        message = "Connected";
      } else {
        color = "grey";
        message = "Unknown";
      }
      return (
        <div className="status mesh-status" id={"status_" + id}>
          <StatusIndicator
            target={"status_" + id}
            color={color}
            message={message}
            placement="right"
            tooltipTarget={".mesh-status"}
          />
        </div>
      );
    }
  };

  return (
    <>
      <CardWithLoading
        className="mb-3"
        loading={loading}
        loadData={loadData}
        header={"Mesh information"}
        body={
          props.active ? (
            mesh ? (
              Object.keys(mesh)?.map((item, i) => {
                return (
                  <Row key={i}>
                    <Col xs="6" className="label">
                      {returnLabel(item)}:
                    </Col>
                    <Col>
                      {item === "meshstatus"
                        ? returnStatusButton(mesh.meshstatus)
                        : item === "meshmode"
                        ? mesh[item]?.toUpperCase()
                        : item === "meshradio"
                        ? radioLabels(mesh?.[item])
                        : mesh[item]?.toString()}
                    </Col>
                  </Row>
                );
              })
            ) : null
          ) : (
            <Row>
              <Col>Device is not connected to the mesh</Col>
              <Col xs="auto" className="text-right">
                <LinkField
                  to={{
                    pathname: `/groups/${groupid}/edit`,
                    state: {},
                  }}
                  text={<BsFillGearFill color="#bebec3" size="15px" />}
                />
              </Col>
            </Row>
          )
        }
      />
    </>
  );
}
