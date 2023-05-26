import React from "react";
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

export default function GroupConfigPopover(props) {
  const { id, togglePopover, groupid, orgid } = props;
  const location = useLocation();
  return (
    <div>
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
        trigger="legacy"
        isOpen={props.popoverOpen}
        toggle={() => togglePopover()}
        target={id}
      >
        <PopoverBody className="headerPopoverBody">
          <Card className="mb-0">
            <CardBody className="p-1">
              <Row className="btn-eq-width">
                <Col>
                  <Link
                    className="text-dark text-left btn bg-transparent"
                    to={{
                      pathname: `/organizations/${orgid}/groups/${groupid}/edit`,
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
    </div>
  );
}
