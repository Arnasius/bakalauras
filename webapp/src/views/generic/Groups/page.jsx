import React, { useState, useEffect } from "react";
import { getGroups, deleteGroup } from "services/groups";
import { accessDisabled } from "services/auth";
import { Row, Col } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import LinkField from "components/Links/LinkField";
import { DeleteModal } from "components/Modals/DeleteModal";
import StatusIndicator from "components/Tools/StatusIndicator";
import { BsFillGearFill, BsTrashFill } from "react-icons/bs";

export function Groups({ currentOrganization }) {
  const [groups, setGroups] = useState([]);
  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });
  const [loading, setLoading] = useState(true);

  const getData = () => {
    getGroups()
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (currentOrganization) {
      getData();
    }
  }, [currentOrganization]);

  const removeGroup = (id, name) => {
    setModal((state) => ({
      ...state,
      loading: false,
      modalOpen: true,
      message: `Are you sure that you want to delete ${name} group?`,
      onDelete: () => {
        return deleteGroup(id)
          .then(() => {
            getData();
            setModal((state) => ({
              ...state,
              modalOpen: false,
              loading: false,
            }));
          })
          .catch((err) => {
            console.error(err);
            setModal((state) => ({
              ...state,
              loading: false,
            }));
          });
      },
    }));
  };

  const returnActionBtns = (data) => {
    const disabled = parseInt(data.devicecount) > 0 ? true : false;
    const tooltipMessage = "Cannot delete group with devices.";
    return (
      <div className="d-flex justify-content-end">
        <LinkField
          id={data.groupname + "-config"}
          to={{
            pathname: `/groups/${data.groupid}/edit`,
            state: {},
          }}
          text={<BsFillGearFill />}
        />

        {accessDisabled(2) ? null : (
          <i className="pl-2">
            <ButtonField
              id={data.groupid.toString()}
              className="btn-remove"
              title={<BsTrashFill />}
              onClick={() => removeGroup(data.groupid, data.groupname)}
              disabled={disabled}
              tooltip={disabled}
              tooltipMessage={tooltipMessage}
              tooltipPlacement="bottom"
            />
          </i>
        )}
      </div>
    );
  };

  const returnDevices = (data) => {
    return (
      <Row className="align-items-center">
        <Col className="col-auto pr-1">{data.devicecount}</Col>
        <Col className="col-auto pr-1 devices-count">
          <Row className="align-items-center">
            <Col className="pr-1">
              <div className="status" id="status_connected">
                <StatusIndicator
                  target="status_connected"
                  color="green"
                  message="Connected"
                />
              </div>
            </Col>
            <Col className="pl-0">{data.up}</Col>
          </Row>
        </Col>
        <Col className="col-auto pl-0 devices-count">
          <Row className="align-items-center">
            <Col className="pr-1">
              <div className="status" id="status_disconnected">
                <StatusIndicator
                  target="status_disconnected"
                  color="red"
                  message="Disconnected"
                />
              </div>
            </Col>
            <Col className="pl-0">{data.down}</Col>
          </Row>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <CardWithLoading
        id="groups"
        loading={loading}
        loadData={getData}
        header={
          <Row>
            <Col>Groups </Col>
            {accessDisabled(2) ? null : (
              <Col xs="auto">
                <LinkField
                  button={true}
                  color="primary"
                  size="xs"
                  title="+ Create group"
                  to={{ pathname: "/groups/add", state: {} }}
                />
              </Col>
            )}
          </Row>
        }
        body={
          <Row>
            <Col>
              <DrawTable
                data={groups}
                columns={{
                  Name: {
                    value: "groupname",
                    component: (data) => (
                      <LinkField
                        to={{
                          pathname: `/groups/${data.groupid}/devices/`,
                          state: {},
                        }}
                        text={data.groupname}
                      />
                    ),
                    visibleOnTablet: true,
                    className: "d-flex",
                  },
                  Description: {
                    secondRow: true,
                    value: "description",
                  },
                  Devices: {
                    value: "devicecount",
                    component: (data) => returnDevices(data),
                    className: "min-col-width-140",
                  },
                  Clients: {
                    value: "clientcount",
                    component: (data) =>
                      `${data.clientcount ? data.clientcount : "0"}`,
                    sortFormat: parseInt,
                    className: "min-col-width-90",
                  },
                  Actions: {
                    component: (data) => returnActionBtns(data),
                    value: "groupId",
                    className: "text-right table-actions",
                    visibleOnTablet: true,
                    hideSort: true,
                  },
                }}
                collapsable
                labelLastChild
                search
                paginate
                sort
              />
            </Col>
          </Row>
        }
      />
      <DeleteModal
        {...modalState}
        closeModal={() => setModal({ ...modalState, modalOpen: false })}
      />
    </>
  );
}
