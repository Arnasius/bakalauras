import React from "react";
import { Navbar, Container } from "reactstrap";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import OrganizationSelect from "components/Header/organizationSelect";

import notify from "services/notify";

import LogoutButton from "components/Security/LogoutButton";

let notificationOptions = {
  place: "br",
  message: null,
  type: "primary",
  autoDismiss: 8,
  closeButton: false,
};

function getNotifyOptions(message, type, timeout) {
  let options = { ...notificationOptions, message };
  if (type) options.type = type;
  if (timeout >= 0) options.autoDismiss = +timeout;
  if (timeout === 0 || timeout > notificationOptions.autoDismiss)
    options.closeButton = true;

  return options;
}

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      uniqueTypes: [],
    };

    this.toggle = this.toggle.bind(this);

    this.feedInfoOff = null;
    this.feedErrorOff = null;
    this.feedSuccessOff = null;
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  openSidebar() {
    document.documentElement.classList.toggle("nav-open");
    this.sidebarToggle.classList.toggle("toggled");
  }

  componentDidMount() {
    const { headerComponents } = this.props;

    this.feedInfoOff = notify.on("info", (data) => {
      let options = getNotifyOptions(data, "info");
      this.notification.notificationAlert(options);
    });
    this.feedErrorOff = notify.on("error", (data) => {
      let options = getNotifyOptions(data, "danger");
      const nextData =
        this.notification.state.notifyBR[0]?.props.children[1].props.children;
      if (
        this.notification.state.notifyBR.length < 1 ||
        (nextData && nextData != data)
      )
        this.notification.notificationAlert(options);
    });
    this.feedSuccessOff = notify.on("success", (data) => {
      let options = getNotifyOptions(data, "success");
      this.notification.notificationAlert(options);
    });

    let uniqueTypes = [];
    headerComponents.map((x) => {
      if (uniqueTypes.indexOf(x.type) === -1) uniqueTypes.push(x.type);
    });
    this.setState({ uniqueTypes });
  }

  componentWillUnmount() {
    if (this.feedInfoOff) this.feedInfoOff();
    if (this.feedErrorOff) this.feedErrorOff();
    if (this.feedSuccessOff) this.feedSuccessOff();
  }

  componentDidUpdate(e) {
    if (
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      this.sidebarToggle.classList.toggle("toggled");
    }
  }

  canAccessComponent(component) {
    return "userLoginLevel" in component
      ? !this.props.accessDisabled(component.userLoginLevel)
      : true;
  }

  render() {
    const { headerComponents, routes } = this.props;
    const { pathname } = this.props.location;

    const currentRoute = routes.find((route) => route.path === pathname);

    return (
      // add or remove classes depending if we are on full-screen-maps page or not
      <Navbar
        expand="lg"
        className={
          pathname.indexOf("full-screen-maps") !== -1
            ? "navbar-absolute fixed-top"
            : "navbar-absolute fixed-top navbar-transparent"
        }
      >
        <Container fluid className="px-0">
          <div className="headerbar-wrapper">
            <OrganizationSelect {...this.props} />
          </div>
          <div className="headerbar-wrapper">
            <div className="navbar-toggle">
              <button
                type="button"
                ref={(ref) => (this.sidebarToggle = ref)}
                className="navbar-toggler"
                onClick={() => this.openSidebar()}
              >
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </button>
            </div>
            {currentRoute?.button ? (
              <currentRoute.button
                notify={(message, type) => {
                  this.notification.notificationAlert(
                    getNotifyOptions(message, type)
                  );
                }}
              />
            ) : null}
          </div>
          <div className="headerbar-wrapper">
            {this.state.uniqueTypes.map((type) => {
              return (
                <ul className={`navbar-nav header-${type}`} key={type}>
                  {headerComponents
                    .filter(
                      (a) => a.type === type && this.canAccessComponent(a)
                    )
                    .map((prop, key) => {
                      const props = { pathname, routes, info: prop.props };
                      return (
                        <React.Fragment key={key}>
                          <prop.component
                            {...this.props}
                            {...(prop.name === "event" ? "" : props)}
                          />
                        </React.Fragment>
                      );
                    })}
                  {type === "actions" ? <LogoutButton /> : null}
                </ul>
              );
            })}
          </div>
        </Container>
        <NotificationAlert ref={(ref) => (this.notification = ref)} />
      </Navbar>
    );
  }
}

export default Header;
