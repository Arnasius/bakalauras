import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Popover,
  PopoverBody,
} from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import ButtonField from "components/Fields/ButtonField";
import { DeleteModal } from "components/Modals/DeleteModal";
import { rebootDevice } from "services/devices";

export default function DeviceActionsPopover(props) {
  const { id, togglePopover, className, device, orgid, setDevice } = props;
  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
    header: "Reboot comfirmation",
    confirmButtonName: "Reboot",
  });

  const location = useLocation();

  return (
    <div className={className}>
      <Button
        type="button"
        color="transparent"
        className="kebab"
        onClick={() => togglePopover(true)}
        id={id}
      >
        <div />
        <div />
        <div />
      </Button>
      <Popover
        placement="bottom"
        className="popover-sm"
        target={id}
        boundariesElement={"#" + id}
        trigger="legacy"
        delay={0}
        isOpen={props.popoverOpen}
        toggle={() => togglePopover()}
      >
        <PopoverBody className="headerPopoverBody">
          <Card className="mb-0">
            <CardBody className="p-1">
              <Row className="btn-eq-width">
                <Col>
                  <Link
                    className="text-dark text-left btn bg-transparent"
                    to={{
                      pathname: `./${device?.deviceid}/edit`,
                      backUrl: location.pathname,
                    }}
                  >
                    Edit device
                  </Link>
                </Col>
              </Row>
              <Row className="btn-eq-width">
                <Col>
                  <ButtonField
                    className="text-dark text-left"
                    color="neutral"
                    title="Reboot device"
                    disabled={!device.status}
                    onClick={() => {
                      togglePopover(false);
                      setModal({
                        ...modalState,
                        message: `Are you sure you want to reboot ${device.devicename} device ?`,
                        modalOpen: true,
                        onDelete: () => {
                          return rebootDevice(
                            device.deviceid,
                            device.groupid,
                            device.devicemac
                          )
                            .then(() => {
                              setDevice({ ...device, status: false });
                            })
                            .catch((err) => {
                              console.error(err);
                            });
                        },
                      });
                    }}
                    tooltip={device.status ? false : true}
                    tooltipMessage={
                      device.status
                        ? null
                        : "Unable to reboot disconnected device"
                    }
                  />
                </Col>
              </Row>
              <Row className="btn-eq-width">
                <Col>
                  <Link
                    className="text-dark text-left btn bg-transparent"
                    to={{
                      pathname: `/organizations/${orgid}/groups/${device.groupid}/devices/${device.deviceid}/upgrade`,
                      backUrl: location.pathname,
                    }}
                  >
                    Upgrade firmware
                  </Link>
                </Col>
              </Row>
              <Row className="btn-eq-width">
                <Col>
                  <Link
                    className="text-dark text-left btn bg-transparent"
                    to={{
                      pathname: `/organizations/${orgid}/groups/${device.groupid}/edit`,
                      backUrl: location.pathname,
                    }}
                  >
                    Configure group
                  </Link>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </PopoverBody>
      </Popover>
      <DeleteModal
        {...modalState}
        closeModal={() => setModal({ ...modalState, modalOpen: false })}
      />
    </div>
  );
}
