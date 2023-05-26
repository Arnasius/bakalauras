import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  CardHeader,
  CardFooter,
} from "reactstrap";

import Status from "services/status";
import events from "services/events";
import WebSockets from "services/ws";
import { sortObjects } from "services/utils";
import { getRelativeTime } from "services/text";
import browserStorage from "services/browserStorage";
import {
  getEventSeverity,
  getColor,
  getEventSeverityDescription,
  checkIfStation,
} from "services/eventsUtils";

import { ConfigApplyCheck } from "state/config";
import InjectCapabilities from "state/capabilities";
import { EventControl, EventWatcher } from "state/checkEvents";

import StatusIndicator from "components/Tools/StatusIndicator";
import { getEventDescriptionComponent } from "components/Events/components/EventDescriptionComponent";
import { getEventDescription } from "components/Events/components/EventDescription";
@EventControl
@EventWatcher
@InjectCapabilities
@ConfigApplyCheck
export default class EventSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      firstTime: true,
    };

    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getData();
    WebSockets.listen("events", {
      message: ({ event, data }) => {
        if (event !== "new-activity-events") return;

        this.setState({ newEventId: data.newEventId });

        const { events, newEventId } = this.state;
        if (events.length && events[0].id < newEventId) this.getData();
      },
    });
  }

  componentDidUpdate(prevProps, _prevState) {
    // config is used because need to load Events data when websockets do not answer
    if (prevProps.configApply && !this.props.configApply) this.getData();
  }

  componentWillUnmount() {
    WebSockets.destroy("events");
  }

  getData() {
    let previousEvent = browserStorage.get("events") || null;

    Status.load("system", "wireless", "zones").then((status_result) => {
      events.load().then((events) => {
        let formattedData = [];

        events &&
          events.map((event) => {
            let isStation =
              event.name === "wirelessPeerAssoc" ||
              event.name === "wirelessPeerDisassoc"
                ? checkIfStation(
                    status_result.wireless,
                    event.wireless_peer.vap
                  )
                : null;

            formattedData.push({
              ...event,
              desc: getEventDescription(
                event,
                status_result.wireless.vaps,
                isStation,
                status_result.zones,
                this.props.capabilities
              ),
              component: getEventDescriptionComponent(
                event,
                status_result.wireless.vaps,
                isStation,
                null,
                this.props.capabilities
              ),
              time:
                Math.floor(Date.now() / 1000) -
                status_result.system.uptime +
                event.timestamp,
              severity: getEventSeverity(event.name),
            });
          });

        let currentLastEvent = formattedData[formattedData.length - 1].id;
        let firstEvents = !previousEvent && formattedData.length;
        let existEvents = formattedData.length && previousEvent;

        if (
          (existEvents &&
            (this.checkNewEvents(currentLastEvent, previousEvent.id) ||
              currentLastEvent < previousEvent.id)) ||
          firstEvents
        ) {
          this.props.setNewEvents(true);
        }

        this.setState({ events: formattedData, firstTime: false });
        browserStorage.set("events", formattedData[0]);
      });
    });
  }

  checkNewEvents(currentLastEvent, previousEvent) {
    if (this.state.firstTime) {
      return currentLastEvent - previousEvent > 1;
    } else {
      return currentLastEvent > previousEvent;
    }
  }

  render() {
    const { events } = this.state;
    const displayedEventsCount = 10;
    const { isOpen, clickEvents, hasNewEvent } = this.props;
    return (
      <EventComponent
        events={events}
        displayedEventsCount={displayedEventsCount}
        isOpen={isOpen}
        clickEvents={clickEvents}
        hasNewEvent={hasNewEvent}
      />
    );
  }
}
export class EventComponent extends React.Component {
  render() {
    const { clickEvents, isOpen, events, displayedEventsCount } = this.props;
    return (
      <>
        <div className="event-sidebar m-0 p-0">
          <div
            onClick={() => {
              clickEvents(false);
            }}
            className={isOpen ? "cover position-fixed" : ""}
          />
          <Card
            className={`right-side position-fixed p-0 ${isOpen ? "show" : ""}`}
          >
            <CardHeader className="px-0 mb-0 bg-white border-bottom">
              <Row className=" m-0">
                <Col className="description pr-0 m-0">
                  Events:
                  <Col className="float-right remove-col col-2">
                    <Button
                      className="btn-remove m-0"
                      onClick={() => {
                        clickEvents(false);
                      }}
                    >
                      <i className="now-ui-icons ui-1_simple-remove" />
                    </Button>
                  </Col>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="py-0">
              <Row>
                <Col className="px-0">
                  {events
                    .sort(
                      sortObjects(
                        "timestamp",
                        "id",
                        "descending",
                        parseFloat,
                        parseFloat
                      )
                    )
                    .slice(0, displayedEventsCount)
                    .map((event, index) => (
                      <div
                        key={index}
                        className={`p-2 ${
                          displayedEventsCount - 1 !== index && "border-bottom"
                        }`}
                      >
                        <Row className="pb-1">
                          <Col className="label m-0 activity-label col-10">
                            <small>{getRelativeTime(event.time)}</small>
                          </Col>
                          <Col
                            id={`${event.name}-${index}`}
                            className="status m-0 ml-2 p-0"
                          >
                            <StatusIndicator
                              target={`${event.name}-${index}`}
                              color={getColor(event.severity)}
                              placement="right"
                              message={getEventSeverityDescription(
                                event.severity
                              )}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col className="py-0">
                            <b>{event.component}</b>
                          </Col>
                        </Row>
                      </div>
                    ))}
                </Col>
              </Row>
            </CardBody>
            <CardFooter className="events-link pt-2 bg-white border-top">
              <Row className="text-center">
                <Link
                  className="w-100"
                  onClick={() => clickEvents(false)}
                  to="/activity"
                >
                  See all events
                </Link>
              </Row>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }
}
