import React from "react";
import CheckIfTablet from "state/isTablet";
import { BreadCrumbWatcher } from "state/breadCrumb";

@BreadCrumbWatcher
@CheckIfTablet
class BreadCrumb extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: [],
      tab: [],
    };
    this.allRoutes = [];
    this.children = [];
    this.handleActiveRoute = this.handleActiveRoute.bind(this);
  }

  componentDidMount() {
    this.handleActiveRoute();
  }

  componentDidUpdate(prevProps, _prevState) {
    if (
      prevProps.sidebarTab !== this.props.sidebarTab ||
      prevProps.tabRoute !== this.props.tabRoute
    ) {
      this.handleActiveRoute();
    }
  }

  handleActiveRoute() {
    const { allRoutes, children } = this;
    const { routes, sidebarTab, tabRoute } = this.props;
    let father;
    let key = sidebarTab;
    let tab = tabRoute;
    this.setState({ tab });

    if (!allRoutes.length) {
      allRoutes.push.apply(allRoutes, routes);

      routes.map((x) => {
        if (x.tabs) allRoutes.push.apply(allRoutes, x.tabs);
        if (x.children) {
          x.children.map((child) => {
            return allRoutes.push.apply(allRoutes, child.tabs);
          });
        }
      });
    }

    let route = this.allRoutes
      .filter((x) => {
        if (x.children) {
          father = x.name;
          var index = children.findIndex((x) => x.father == father);
          x.children.filter((x) => (x.father = father));
          if (index === -1) {
            children.push.apply(children, x.children);
          }
        }
        return x.path === key && !x.redirect;
      })
      .map((x) => x.name);

    tab
      ? this.setState({
          tab: allRoutes.filter((x) => x.path === tab).map((x) => x.name),
        })
      : null;

    if (!route.length) {
      if (!key && tab) return (route = null);

      let child;

      this.children
        .filter((x) => x.path === key)
        .map((x) => {
          father = x.father;
          child = x.name;
          tab = allRoutes.filter((x) => x.path === tab).map((x) => x.name);
        });
      route = [{ father }, { child }];
    }
    this.setState({ location: route });
  }

  render() {
    const { width } = this.props;
    const { location, tab } = this.state;
    let istablet = width < 1150;

    return (
      <ul className="navbar-breadcrumb navbar-nav">
        {location && location.length > 1 ? (
          location.map((route, i) => {
            return istablet ? (
              <React.Fragment key={i}>
                {route.father && (
                  <li className="m-0 p-0">
                    <div id={tab ? "father" : "basic"}> {route.father} </div>
                  </li>
                )}
                {!tab && route.child && (
                  <li className="m-0 p-0">
                    <div id="child"> {route.child} </div>
                  </li>
                )}
              </React.Fragment>
            ) : (
              <React.Fragment key={i}>
                {route.father && (
                  <li className="m-0 p-0">
                    <div> {route.father}</div>
                  </li>
                )}
                {route.child && (
                  <li className="m-0 p-0">
                    <div id="child">{route.child}</div>
                  </li>
                )}
              </React.Fragment>
            );
          })
        ) : (
          <li className="m-0 p-0">
            <div id={tab ? "father" : "basic"}>{location}</div>
          </li>
        )}
        {tab ? (
          <li className="m-0 p-0">
            <div id="child">{tab}</div>
          </li>
        ) : null}
      </ul>
    );
  }
}

export default BreadCrumb;
