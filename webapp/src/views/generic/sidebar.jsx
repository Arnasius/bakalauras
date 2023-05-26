import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "reactstrap";
import WidthToggler from "components/Sidebar/widthToggler";
import { getCurrentOrganization } from "services/organizations";
import Footer from "./footer";

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.activeRoute.bind(this);
  }

  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    if (routeName == "/interfaces") {
      return this.props.location.match(/(interfaces|ethernet)/)
        ? " active"
        : "";
    } else {
      return this.props.location === routeName ? " active" : "";
    }
  }

  componentDidUpdate() {
    const location = this.props.location.pathname;

    if (this.props.sidebarTab !== location) {
      document.getElementsByClassName("wrapper")[0].scrollTop = 0;
    }
  }

  render() {
    const { routes, brandProps, collapsed, toggleSidebar, isTablet } =
      this.props;
    const collapsable = brandProps.collapsableSidebar;

    return (
      <div
        className={`sidebar ${
          collapsable && collapsed && !isTablet ? "collapsed" : ""
        }`}
      >
        {!collapsable || isTablet ? null : (
          <WidthToggler
            isSidebarCollapsed={collapsed}
            toggleSidebar={toggleSidebar}
          />
        )}
        <div className="logo d-flex align-items-center">
          <a href="#">
            <div className="logo-img" />
          </a>
        </div>
        <div className="sidebar-wrapper" ref={(ref) => (this.sidebar = ref)}>
          <MenuLink
            childrens={routes}
            activeRoute={this.activeRoute}
            location={this.props.location.pathname}
            accessDisabled={this.props.accessDisabled}
            collapsed={collapsed}
          />
        </div>

        <Footer fluid brandProps={brandProps} />
      </div>
    );
  }
}
class MenuLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdowns: {},
    };
    this.activeRoute = this.props.activeRoute;
    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  toggleDropdown(route) {
    const { dropdowns } = this.state;
    this.setState({
      dropdowns: { [route]: dropdowns[route] ? !dropdowns[route] : true },
    });
  }

  render() {
    const { childrens, accessDisabled, location, collapsed } = this.props;
    const org = getCurrentOrganization();

    return (
      <Nav>
        {childrens.map((prop, key) => {
          if (prop.redirect) return null;
          if (prop.nested) return null;
          if (accessDisabled(prop.userLoginLevel)) return null;
          let children = prop.children;
          const parentClass = !prop.father ? " parent" : "";

          return (
            <li
              key={key}
              className={`${
                prop.children && this.state.dropdowns[prop.name]
                  ? "dropdown-on"
                  : "dropdown-off" + this.activeRoute(prop.path)
              } ${parentClass}`}
            >
              <NavLink
                exact
                to={
                  prop.sidePath
                    ? prop.component
                      ? `/organizations/${org}` + prop.sidePath
                      : `/organizations/${org}` + prop.children[0].sidePath
                    : prop.path
                }
                replace
                className={`nav-link nav-link-${prop.name} ${
                  location === prop.path ? "disabled" : ""
                }`}
                activeClassName="active"
                onClick={() => this.toggleDropdown(prop.name)}
              >
                {prop.icon ? (
                  <i className={"now-ui-icons " + prop.icon} />
                ) : (
                  <i className={prop.customIcon} />
                )}
                <p>{prop.name}</p>
              </NavLink>
              {children && !collapsed ? (
                <>
                  <div
                    className="triangle-block"
                    onClick={() => this.toggleDropdown(prop.name)}
                  >
                    <i
                      onClick={() => this.toggleDropdown(prop.name)}
                      className={
                        this.state.dropdowns[prop.name]
                          ? "triangle-up now-ui-icons arrows-1_minimal-down"
                          : "now-ui-icons arrows-1_minimal-down"
                      }
                    />
                  </div>
                  <MenuLink
                    childrens={children}
                    activeRoute={this.activeRoute}
                    location={this.props.location}
                    accessDisabled={this.props.accessDisabled}
                  />
                </>
              ) : null}
            </li>
          );
        })}
      </Nav>
    );
  }
}
