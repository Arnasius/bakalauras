import React from "react";
import { Row, Col } from "reactstrap";

import WpaPskSettings from "./SecurityWpaPsk";
import StaWpaEapSettings from "./SecurityStaWpaEap";
import ApWpaEapSettings from "./SecurityApWpaEap";

import InjectCapabilities from "state/capabilities";

import SecurityModeSelect from "components/Fields/SecurityModeSelect";
@InjectCapabilities
export default class SecuritySettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.props.securityState;

    this.handleSecurityMode = this.handleSecurityMode.bind(this);
  }

  componentDidUpdate(prevProps, _prevState, _snapshot) {
    if (prevProps.securityState !== this.props.securityState)
      this.setState(this.props.securityState);
  }

  handleSecurityMode(event) {
    this.setState({ mode: event.target.value }, () =>
      this.props.onChange(this.state)
    );
  }

  handleSecuritySettings(name, value) {
    this.setState({ [name]: value }, () => this.props.onChange(this.state));
  }

  render() {
    const {
      inCard,
      wirelessMode,
      excludeWpaeap,
      trackChange,
      makeLabel,
      name,
      radios,
    } = this.props;
    const { mode } = this.state;

    return (
      <>
        <SecurityModeSelect
          name={name}
          value={mode}
          onChange={this.handleSecurityMode}
          track={trackChange}
          makeLabel={makeLabel}
          excludeWpaeap={excludeWpaeap}
          inCard={inCard}
          allowWpa3={radios?.find(
            (x) => this.props.capabilities.radios[x]?.vendor == "qualcomm"
          )}
        />
        {mode !== "sae" ? null : (
          <Row>
            <Col>
              <div className="alert alert-info">
                WPA3 is a new generation encryption technology, which greatly
                enhances the security, but some old devices may be incompatible
                and thus cannot be accessed if WPA3 is selected
              </div>
            </Col>
          </Row>
        )}
        {mode !== "wpapsksae" ? null : (
          <Row>
            <Col>
              <div className="alert alert-info">
                WPA2/WPA3 mixed mode uses WPA3 Personal with devices that
                support it while allowing older devices to use WPA2 Personal
                mode instead.
              </div>
            </Col>
          </Row>
        )}

        {mode === "wpapsk" || mode === "sae" || mode === "wpapsksae" ? (
          <WpaPskSettings
            state={this.state[mode]}
            onChange={(e) => this.handleSecuritySettings(mode, e)}
            trackChange={trackChange}
            makeLabel={makeLabel}
          />
        ) : null}

        {(mode === "wpaeap256" || mode === "wpaeap") && (
          <>
            {wirelessMode === "sta" ? (
              <StaWpaEapSettings
                state={this.state.wpaeap}
                onChange={(e) => this.handleSecuritySettings("wpaeap", e)}
                trackChange={trackChange}
                makeLabel={makeLabel}
              />
            ) : (
              <ApWpaEapSettings
                state={this.state.radius}
                onChange={(e) => this.handleSecuritySettings("radius", e)}
                trackChange={trackChange}
                makeLabel={makeLabel}
              />
            )}
          </>
        )}
      </>
    );
  }
}
