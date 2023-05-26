import React, { useState, useEffect } from "react";
import { getPendingDevices, deleteDevice } from "services/devices";
import { accessDisabled } from "services/auth";
import { Row, Col, CardBody } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import DrawTable from "components/DrawTable/DrawTable";
import { DeleteModal } from "components/Modals/DeleteModal";
import Spinner from "components/Tools/Spinner";

export default function PendingDevices(props) {
  const [devices, setDevices] = useState([]);
  const [modal, setModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = props;

  const getData = () => {
    getPendingDevices()
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
    if (currentOrganization) {
      getData();
    }
  }, [currentOrganization]);

  const returnActionBtns = (data) => {
    return (
      <>
        <a
          href={`#/organizations/${currentOrganization}/pending-devices/${data.deviceid}/register`}
          className="now-ui-icons ui-1_check btn-add btn-remove"
        ></a>
        {accessDisabled(2) ? null : (
          <ButtonField
            className="btn-remove"
            title={<i className="pl-2 now-ui-icons ui-1_simple-remove" />}
            onClick={() =>
              setModal((state) => ({
                ...state,
                loading: false,
                onDelete: () => {
                  return deleteDevice(data.deviceid)
                    .then((res) => {
                      console.info(res);
                      setDevices(
                        devices.filter(
                          (value) => value.deviceid != data.deviceid
                        )
                      );
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                },
                message: `Are you sure you want to delete ${data.devicename} device ?`,
                modalOpen: true,
              }))
            }
          />
        )}
      </>
    );
  };

  return (
    <>
      <CardBody>
        <Row>
          <Col>
            {loading ? (
              <Spinner className="center" />
            ) : (
              <DrawTable
                data={devices}
                columns={{
                  Name: {
                    value: "devicename",
                    visibleOnTablet: true,
                  },
                  MAC: { value: "devicemac" },
                  Firmware: { value: "fwversion" },
                  Model: {
                    value: "model",
                    component: (data) => (data.board || "-").toUpperCase(),
                  },
                  Actions: {
                    component: (data) => returnActionBtns(data),
                    value: "devicename",
                    className: "text-right",
                    visibleOnTablet: true,
                    hideSort: true,
                    width: "55px",
                  },
                }}
                sort
                search
                paginate
                itemsPerPage={5}
                labelLastChild
              />
            )}
          </Col>
        </Row>
      </CardBody>
      <DeleteModal
        {...modal}
        closeModal={() => setModal({ ...modal, modalOpen: false })}
      />
    </>
  );
}
