import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";

import { buildStore } from "state";
import { Security } from "components/Security";

import ManagementPage from "views/generic";
import { routes, brandProps, headerComponents } from "views/generic/routes";
import { noOrgRoutes } from "views/generic/routesNoOrg";
import { withCurrentOrg } from "views/generic/withCurrentOrg";

class WebApp extends React.Component {
  constructor(props) {
    super(props);
    this.store = buildStore();
  }

  render() {
    return (
      <Provider store={this.store}>
        <Security>
          <RoutesComponent
            routes={routes}
            noOrgRoutes={noOrgRoutes}
            brandProps={brandProps}
            headerComponents={headerComponents}
          />
        </Security>
      </Provider>
    );
  }
}

class RoutesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.fitsRequirements = this.fitsRequirements.bind(this);
    this.getValue = this.getValue.bind(this);
  }

  getValue(data) {
    if (!data.requiredCapability) return true;
    return this.checkRequiredCapability(data.requiredCapability);
  }

  fitsRequirements(data) {
    return data.filter((obj) => {
      if (obj?.children) {
        obj.children = obj.children.filter((child) => {
          return this.getValue(child);
        });
      }

      if (obj?.tabs) {
        obj.tabs = obj.tabs.filter((tab) => {
          return this.getValue(tab);
        });
      }

      return this.getValue(obj);
    });
  }

  render() {
    const { routes, brandProps, noOrgRoutes, headerComponents } = this.props;
    const ContentWithOrg = withCurrentOrg(ManagementPage);

    return (
      <HashRouter>
        <Switch>
          <Route
            path="/"
            render={(props) => (
              <ContentWithOrg
                {...props}
                routes={this.fitsRequirements(routes)}
                noOrgRoutes={this.fitsRequirements(noOrgRoutes)}
                brandProps={brandProps}
                headerComponents={this.fitsRequirements(headerComponents)}
              />
            )}
          />
          ;
        </Switch>
      </HashRouter>
    );
  }
}

export default WebApp;
