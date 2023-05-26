import React, { Component } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Popover,
  PopoverBody,
} from "reactstrap";
import { Link } from "react-router-dom";
import Spinner from "components/Tools/Spinner";

export default class ActionsPopover extends Component {
  render() {
    const { id, togglePopover, showRenewBtn, configuringAllowed, configLink } =
      this.props;

    return (
      <>
        <Button
          type="button"
          color="neutral"
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
          isOpen={this.props.popoverOpen}
          toggle={() => togglePopover()}
        >
          <PopoverBody className="headerPopoverBody">
            <Card className="mb-0">
              <CardBody>
                {showRenewBtn ? (
                  <Row className="btn-eq-width">
                    <Col>
                      <Button
                        onClick={() => {
                          this.props.get_renew_dhcp();
                        }}
                        color="neutral"
                        id={"refresh-tooltip-" + id}
                        className="text-dark text-left"
                      >
                        Renew DHCP{" "}
                        {this.props.updating ? (
                          <Spinner className="p-0" />
                        ) : null}
                      </Button>
                    </Col>
                  </Row>
                ) : null}
                {
                  (configuringAllowed,
                  configLink ? (
                    <Row className="btn-eq-width">
                      <Col>
                        <Link
                          className="text-dark text-left btn bg-transparent"
                          to={configLink}
                        >
                          Configure
                        </Link>
                      </Col>
                    </Row>
                  ) : null)
                }
              </CardBody>
            </Card>
          </PopoverBody>
        </Popover>
      </>
    );
  }
}
