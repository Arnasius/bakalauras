import React, { useState } from "react";
import { Badge } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import { accessDisabled } from "services/auth";
import { DeleteDeviceModal } from "components/Modals/DeleteDeviceModal";
import { DeleteModal } from "components/Modals/DeleteModal";
import DrawTable from "components/DrawTable/DrawTable";
import ButtonField from "components/Fields/ButtonField";
import LinkField from "components/Links/LinkField";
import StatusIndicator from "components/Tools/StatusIndicator";
import {
  BsArrowRepeat,
  BsFillGearFill,
  BsTrashFill,
  BsEject,
} from "react-icons/bs";
import { rebootDevice } from "services/devices";
import { sortableIp, secondsFromDate } from "services/text";

export default function Devices({
  devices,
  groupId,
  getData,
  groupConfigSeq,
  props,
}) {
  const location = useLocation();
  const [deleteModalState, setDeleteModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });
  const [rebootModalState, setRebootModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
    header: "Reboot comfirmation",
    confirmButtonName: "Reboot",
  });

  const devicesWithGroup = devices.map(
    (device) => (device = { ...device, groupid: groupId })
  );

  const reboot = (data) => {
    devices.find((x) => x.deviceid === data.deviceid).status = false;
    return rebootDevice(data.deviceid, data.groupid, data.devicemac)
      .then(() => {
        setRebootModal((state) => ({
          ...state,
          modalOpen: false,
          loading: false,
        }));
      })
      .catch((err) => {
        console.error(err);
        setRebootModal((state) => ({
          ...state,
          loading: false,
        }));
      });
  };

  const returnStatusButton = (id, status) => {
    return (
      <div className="status m-auto" id={"status_" + id}>
        <StatusIndicator
          target={"status_" + id}
          color={status ? "green" : "red"}
          message={status ? "Connected" : "Disconnected"}
        />
      </div>
    );
  };

  const returnActionBtns = (data) => {
    return accessDisabled(2) ? null : (
      <>
        <Link
          to={{
            pathname: `${location.pathname}${data.deviceid}/edit`,
            backUrl: location.pathname,
          }}
        >
          <BsFillGearFill />
        </Link>
        <i className="pl-2">
          <Link
            to={{
              pathname: `${location.pathname}${data.deviceid}/upgrade`,
              backUrl: location.pathname,
            }}
          >
            <BsEject />
          </Link>
        </i>

        <i className="pl-2">
          <ButtonField
            className="btn-reload"
            title={<BsArrowRepeat />}
            disabled={!data.status}
            onClick={() =>
              setRebootModal((state) => ({
                ...state,
                loading: false,
                onDelete: () => reboot(data),
                message: `Are you sure you want to reboot ${data.devicename} device ?`,
                modalOpen: true,
              }))
            }
            tooltip
            tooltipMessage={
              data.status
                ? "Reboot device"
                : "Unable to reboot disconnected device"
            }
            tooltipPlacement="bottom"
          />
        </i>
        <i className="pl-2">
          <ButtonField
            className="btn-remove"
            title={<BsTrashFill />}
            onClick={() =>
              setDeleteModal((state) => ({
                ...state,
                loading: false,
                message: `Are you sure you want to delete ${data.devicename} device ?`,
                deviceMac: data.devicemac,
                deviceId: data.deviceid,
                deviceStatus: data.status,
                getData: getData,
                modalOpen: true,
              }))
            }
          />
        </i>
      </>
    );
  };

  const returnBadge = (data) => {
    return groupConfigSeq !== data.configseq ? (
      <Badge
        href={`#/organizations/${props.currentOrganization}/groups/${groupId}/view/devices/${data.deviceid}`}
        pill
        color="warning"
      >
        Updating
      </Badge>
    ) : (
      <Badge pill color="primary">
        Up to date
      </Badge>
    );
  };

  return (
    <>
      <DrawTable
        data={devicesWithGroup}
        columns={{
          Status: {
            width: "85px",
            value: "heartbeat",
            sortFormat: secondsFromDate,
            ClassName: "text-right",
            component: (data) => returnStatusButton(data.deviceid, data.status),
          },
          Name: {
            value: "devicename",
            component: (data) => (
              <LinkField
                to={{
                  pathname: `/groups/${groupId}/devices/${data.deviceid}`,
                  state: {},
                }}
                text={data.devicename}
              />
            ),
            visibleOnTablet: true,
          },
          MAC: {
            value: "devicemac",
            component: (data) => (data.devicemac || "-").toUpperCase(),
          },
          Model: {
            value: "board",
            component: (data) => (data.board || "-").toUpperCase(),
          },
          IP: {
            value: "ip_address",
            sortFormat: sortableIp,
            component: (data) =>
              data.ip_address ? (
                <a
                  href={`http://${data.ip_address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.ip_address}
                </a>
              ) : (
                "-"
              ),
          },
          "Mesh Mode": {
            value: "meshmode",
            component: (data) => (data.meshmode || "-").toUpperCase(),
          },
          Configuration: {
            value: "configseq",
            sortFormat: (data) => {
              return groupConfigSeq !== data;
            },
            component: (data) => returnBadge(data),
          },
          Actions: {
            component: (data) => returnActionBtns(data),
            value: "deviceid",
            className: "table-actions text-right",
            visibleOnTablet: true,
            hideSort: true,
            width: "120px",
          },
        }}
        sort
        search
        paginate
        labelLastChild
      />
      <DeleteDeviceModal
        {...deleteModalState}
        closeModal={() =>
          setDeleteModal({ ...deleteModalState, modalOpen: false })
        }
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
