import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import { ClosureComponent } from "components/Controls/ClosureComponent";
export default class CornerNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };

    this.toggleNav = this.toggleNav.bind(this);
  }

  toggleNav(value) {
    this.setState({ isOpen: value });
  }

  render() {
    const { currentTab, changeTab, tabs } = this.props;
    const { isOpen } = this.state;

    return (
      <ClosureComponent toggle={this.toggleNav}>
        <div className="mobile-config-menu corner-menu">
          <div
            className="toggler-wrapper"
            onClick={() => this.toggleNav(!isOpen)}
          >
            <button type="button" className="navbar-toggler config-nav-toggler">
              <span className="navbar-toggler-bar" />
              <span className="navbar-toggler-bar" />
              <span className="navbar-toggler-bar" />
            </button>
          </div>

          <Nav tabs className={isOpen ? "open" : ""}>
            {tabs.map((tab) => {
              return (
                <NavItem key={tab.id} className="m-0">
                  <NavLink
                    className={tab.id === currentTab ? "active" : ""}
                    onClick={() => {
                      changeTab(tab.id);
                      this.toggleNav(!isOpen);
                    }}
                  >
                    {tab.title}
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
