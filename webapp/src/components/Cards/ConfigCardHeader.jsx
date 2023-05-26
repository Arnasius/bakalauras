import React from "react";
import { CardHeader, Row, Col } from "reactstrap";
import SwitchField from "components/Fields/SwitchField";

class ConfigCardHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      makeLabel,
      tabName,
      tabDescription,
      label,
      showSwitch,
      switchFieldName,
      enabled,
      onChange,
      track,
      switchDisabled,
      switchDisabledMessage,
      infoMessage,
      tooltipTarget,
    } = this.props;

    const switchLabel = label ? label : enabled ? "Enabled" : "Disabled";

    return (
      <CardHeader className="mb-0">
        <Row className="mb-0 label">
          <Col>{tabName}</Col>
        </Row>
        <Row>
          {tabDescription ? (
            <Col md="12" className="feature-description mb-2">
              <small>{tabDescription}</small>
            </Col>
          ) : null}
          {infoMessage ? (
            <Col>
              <div className="alert alert-info">{infoMessage}</div>
            </Col>
          ) : null}
          {showSwitch ? (
            <Col md="7" className="feature-description d-flex">
              <SwitchField
                name={switchFieldName}
                className="pt-1 pb-1 configMeshEnabled"
                checked={enabled}
                onChange={onChange}
                track={track}
                label={switchLabel}
                disabled={switchDisabled}
                tooltip={switchDisabled}
                tooltipMessage={switchDisabledMessage}
                makeLabel={() => makeLabel("Enabled")}
                tooltipTarget={tooltipTarget}
              />
            </Col>
          ) : null}
        </Row>
      </CardHeader>
    );
  }
}

export default ConfigCardHeader;
