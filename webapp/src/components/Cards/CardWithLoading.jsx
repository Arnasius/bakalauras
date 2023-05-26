import React from "react";
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import Spinner from "components/Tools/Spinner";

class CardWithLoading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      retrying: false,
    };
    this.ConnectTimeout = null;
    this.retryConnect = this.retryConnect.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.error !== this.props.error && this.props.error) {
      this.retryConnect(5);
      this.setState({ retrying: true });
    }

    if (!this.props.error && this.state.retrying) {
      clearTimeout(this.ConnectTimeout);
      this.setState({ retrying: false });
    }
  }

  retryConnect(timeout) {
    if (timeout <= 15) {
      if (this.props.loadData) this.props.loadData();
      this.ConnectTimeout = setTimeout(() => {
        this.retryConnect(timeout * 2);
      }, timeout * 1000);
    } else {
      clearTimeout(this.ConnectTimeout);
      this.setState({ retrying: false });
    }
  }

  render() {
    const {
      header,
      body,
      loading,
      error,
      loadData,
      bodyClassName,
      cardHeader,
      ...passThroughProps
    } = this.props;
    const { retrying } = this.state;
    if (!header && !body && !cardHeader && !error && !loading) return null;

    return (
      <>
        {header ? (
          <Row className="mb-1 label">
            <Col>{header}</Col>
          </Row>
        ) : null}
        <Card {...passThroughProps}>
          <CardHeader className="mb-0">{cardHeader}</CardHeader>
          <CardBody
            className={loading || error || retrying ? "" : bodyClassName}
          >
            {loading || retrying ? (
              <Spinner className="center" />
            ) : error ? (
              <p className="error-message mb-0">
                {" "}
                The connection has timed out. No data received from server.{" "}
              </p>
            ) : (
              <>{body}</>
            )}
          </CardBody>
        </Card>
      </>
    );
  }
}

export default CardWithLoading;
