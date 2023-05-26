import React, { useLayoutEffect, useState } from "react";
import { Row, Col, Card, CardBody, Badge } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import ButtonField from "components/Fields/ButtonField";
import { getFirmwares, deleteFirmware } from "services/server";
import { BsTrashFill } from "react-icons/bs";
import { DeleteModal } from "components/Modals/DeleteModal";
import { accessDisabled } from "services/auth";
import { upgradeDevice } from "services/devices";
import { getCurrentOrganization } from "services/organizations";
import { useHistory } from "react-router-dom";

export default function FirmwaresTable(props) {
  const { device } = props;
  const [firmwaresData, setFirmwaresData] = useState([]);
  const history = useHistory();
  const currentOrganization = getCurrentOrganization();

  const [rebootModalState, setRebootModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
    header: "Upgrade comfirmation",
    confirmButtonName: "Start upgrade",
  });

  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
  });

  useLayoutEffect(() => {
    getData();
  }, [device]);

  const getData = () => {
    getFirmwares()
      .then((res) => {
        if (device)
          res.data = res.data.filter(
            (item) => item.board.toLowerCase() == device.board.toLowerCase()
          );
        setFirmwaresData(res.data);
      })
      .catch((err) => console.error(err));
  };

  const returnActionBtns = (data) => {
    if (device)
      return (
        <Badge
          onClick={() =>
            setRebootModal((state) => ({
              ...state,
              loading: false,
              onDelete: () => upgrade(data, device),
              message: `Are you sure you want to upgrade ${device.devicename} device ?`,
              modalOpen: true,
            }))
          }
          color="light"
        >
          Start Upgrade
        </Badge>
      );

    if (accessDisabled(0)) return null;

    return (
      <i className="pl-2">
        <ButtonField
          id={data.firmwareid.toString()}
          className="btn-remove"
          title={<BsTrashFill />}
          onClick={() =>
            removeFirmware(data.firmwareid, data.filename, data.name)
          }
        />
      </i>
    );
  };

  const upgrade = (data, device) => {
    upgradeDevice(
      device.deviceid,
      device.groupid,
      data.checksum,
      data.filename,
      device.devicemac
    )
      .then(() => {
        setRebootModal((state) => ({
          ...state,
          modalOpen: false,
        }));
        history.push(
          `/organizations/${currentOrganization}/groups/${device.groupid}/devices/${device.deviceid}`
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const removeFirmware = (id, filename, name) => {
    setModal((state) => ({
      ...state,
      loading: false,
      modalOpen: true,
      message: `Are you sure that you want to delete ${name} firmware?`,
      onDelete: () => {
        return deleteFirmware(id, filename)
          .then(() => {
            getData();
          })
          .catch((err) => {
            console.error(err);
          });
      },
    }));
  };

  return (
    <>
      <Row className="mt-3 mb-1 label">
        <Col>Available device firmwares </Col>
        {!accessDisabled(0) && !device ? (
          <Col xs="auto">
            <ButtonField
              color="primary"
              size="xs"
              title="+ Add"
              href="/#/settings/firmware-upload"
            />
          </Col>
        ) : null}
      </Row>
      <Card>
        <CardBody>
          <DrawTable
            data={firmwaresData}
            columns={{
              Name: { value: "name", visibleOnTablet: true },
              Model: {
                value: "board",
                component: (data) => data.board?.toUpperCase(),
              },
              Uploaded: {
                value: "createddate",
                component: (data) => new Date(data?.createddate).toDateString(),
              },
              "": {
                component: (data) => returnActionBtns(data),
                value: "firmwareid",
                className: "text-right table-actions",
                visibleOnTablet: true,
                hideSort: true,
              },
            }}
            search
            sort
            paginate
          />
        </CardBody>
      </Card>
      <DeleteModal
        {...modalState}
        closeModal={() => setModal({ ...modalState, modalOpen: false })}
      />
      <DeleteModal
        {...rebootModalState}
        closeModal={() =>
          setRebootModal({ ...rebootModalState, modalOpen: false })
        }
      />
    </>
  );
}
