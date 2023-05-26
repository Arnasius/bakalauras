import React, { useState, useEffect } from "react";
import { Badge } from "reactstrap";
import { getPendingDevices, deleteDevice } from "services/devices";
import { accessDisabled } from "services/auth";
import { Row, Col } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import DrawTable from "components/DrawTable/DrawTable";
import { DeleteModal } from "components/Modals/DeleteModal";
import { secondsFromDate } from "services/text";

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
    return accessDisabled(2) ? null : (
      <>
        <Badge
          href={location + "/" + data.deviceid + "/register"}
          className="badge-table-action"
          color="success"
        >
          Accept
        </Badge>

        <Badge
          className="badge-big badge-table-action ml-1"
          color="secondary"
          onClick={() =>
            setModal((state) => ({
              ...state,
              onDelete: () => {
                return deleteDevice(data.deviceid)
                  .then(() => {
                    setDevices(
                      devices.filter((value) => value.deviceid != data.deviceid)
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
        >
          Delete
        </Badge>
      </>
    );
  };

  const returnLastSeen = (data) => {
    let currentDate = new Date();
    let lastSeen = "";
    if (data.lastintro) {
      let time = Math.floor(
        (currentDate.getTime() - Date.parse(new Date(data.lastintro))) / 60000
      );
      if (time == 0) lastSeen = "now";
      else if (time > 0 && time < 60) lastSeen = time + " minutes ago";
      else if (time >= 60) {
        lastSeen = Math.floor(time / 60) + ` hour${time < 120 ? "" : "s"} ago`;
      }
    }
    return <div>{data.lastintro ? lastSeen : "-"}</div>;
  };

  return (
    <>
      <CardWithLoading
        id="group"
        loading={loading}
        loadData={getData}
        header={
          <Row>
            <Col>Pending Devices</Col>
          </Row>
        }
        body={
          <>
            <Row>
              <Col>
                <DrawTable
                  data={devices}
                  columns={{
                    Name: {
                      value: "devicename",
                      visibleOnTablet: true,
                    },
                    MAC: {
                      value: "devicemac",
                      component: (data) =>
                        (data.devicemac || "-").toUpperCase(),
                    },
                    Firmware: { value: "fwversion", secondRow: true },
                    Model: {
                      value: "board",
                      component: (data) => (data.board || "-").toUpperCase(),
                    },
                    "Last seen": {
                      value: "lastintro",
                      sortFormat: secondsFromDate,
                      component: (data) => returnLastSeen(data),
                    },
                    "": {
                      component: (data) => returnActionBtns(data),
                      value: "devicename",
                      className: "text-right",
                      visibleOnTablet: true,
                      hideSort: true,
                      width: "220px",
                    },
                  }}
                  collapsable
                  sort
                  search
                  paginate
                />
              </Col>
            </Row>
          </>
        }
      />
      <DeleteModal
        {...modal}
        closeModal={() => setModal({ ...modal, modalOpen: false })}
      />
    </>
  );
}
