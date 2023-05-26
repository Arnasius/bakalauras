import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { BreadCrumbControl } from "state/breadCrumb";
import { ClosureComponent } from "../Controls/ClosureComponent";
import auth from "../../services/auth";

@BreadCrumbControl
export class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.props.setTab(this.props.activeTab);
  }

  componentDidUpdate(e) {
    if (e.activeTab !== this.props.activeTab) {
      this.props.setTab(this.props.activeTab);
    }
  }

  toggle(value) {
    this.setState({
      open: value,
    });
  }

  render() {
    const { activeTab, tabChangeHandler, routes } = this.props;
    return (
      <ClosureComponent toggle={this.toggle}>
        <div className="mobile-config-menu mb-3">
          <div
            className="toggler-wrapper"
            onClick={() => this.toggle(!this.state.open)}
          >
            <button type="button" className="navbar-toggler config-nav-toggler">
              <span className="navbar-toggler-bar" />
              <span className="navbar-toggler-bar" />
              <span className="navbar-toggler-bar" />
            </button>
          </div>
          <Nav tabs className={this.state.open ? "open" : ""}>
            {routes.map((prop, key) => {
              if (auth.accessDisabled(prop.userLoginLevel)) return;
              return (
                <NavItem key={key}>
                  <NavLink
                    className={classnames(
                      { active: activeTab === prop.path },
                      "nav-link-" + prop.name.replace(" ", "-")
                    )}
                    onClick={() => {
                      tabChangeHandler(prop.path);
                      this.toggle(!this.state.open);
                    }}
                  >
                    {prop.name}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
        </div>
      </ClosureComponent>
    );
  }
}
