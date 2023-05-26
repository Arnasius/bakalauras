import React from "react";
import { CardBody, Card, CardHeader, Row, Col } from "reactstrap";
import { Route, Switch, Redirect } from "react-router-dom";

import { BrandPropsControl } from "state/brandProps";
import browserStorage from "services/browserStorage";
import auth from "services/auth";
import Block from "./block";
import Header from "./header";
import Sidebar from "./sidebar";
import ws from "../../services/ws";
import ConnectionWatcher from "./ConnectionWatcher";
import ScrollToTop from "components/Controls/ScrollToTop";
import { getOrgs } from "services/organizations";

@BrandPropsControl
class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSidebarCollapsed: browserStorage.get("isSidebarCollapsed") || false,
    };
    this.allRoutes = [];
    this.children = [];

    this.props.setProps(this.props.brandProps);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  toggleSidebar() {
    const value = !this.state.isSidebarCollapsed;

    browserStorage.set("isSidebarCollapsed", value);
    this.setState({ isSidebarCollapsed: value });
  }

  componentDidMount() {
    ws.connect();
  }

  componentWillUnmount() {
    ws.disconnect();
  }

  render() {
    const routes = getOrgs().length
      ? this.props.routes
      : this.props.noOrgRoutes;
    const {
      brandProps,
      headerComponents,
      isTablet,
      currentOrganization,
      organizations,
      handleChange,
      refreshOrgs,
    } = this.props;
    const { isSidebarCollapsed } = this.state;
    const { collapsableSidebar } = brandProps;

    return (
      <>
        <div className="wrapper">
          <Sidebar
            {...this.props}
            routes={routes}
            accessDisabled={auth.accessDisabled}
            brandProps={brandProps}
            collapsed={isSidebarCollapsed}
            toggleSidebar={this.toggleSidebar}
            isTablet={isTablet}
          />
          <div
            className={`main-panel ${
              collapsableSidebar && isSidebarCollapsed && !isTablet
                ? "collapsed"
                : ""
            }`}
            ref={(ref) => (this.mainPanel = ref)}
          >
            <Header
              {...this.props}
              routes={routes}
              headerComponents={headerComponents}
              accessDisabled={auth.accessDisabled}
            />
            <div className="content">
              <Switch>
                <RouteComp
                  organizations={organizations}
                  handleChange={handleChange}
                  refreshOrgs={refreshOrgs}
                  currentOrganization={currentOrganization}
                  routes={routes}
                  accessDisabled={auth.accessDisabled}
                />
              </Switch>
            </div>
          </div>
          <ScrollToTop />
          <Block />
          <ConnectionWatcher />
        </div>
      </>
    );
  }
}

class RouteComp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { routes, accessDisabled, currentOrganization } = this.props;
    return (
      <>
        {routes.map((prop, key) => {
          let children = prop.children;
          return (
            <React.Fragment key={key}>
              <Switch>
                {prop.redirect && currentOrganization && (
                  <Redirect
                    exact
                    from={prop.path}
                    to={`/organizations/${currentOrganization}/dashboard`}
                  />
                )}
                {prop.component && (
                  <Route
                    exact
                    strict
                    path={prop.path}
                    render={(props) => (
                      <ErrorBoundary {...props} {...this.props}>
                        <prop.component
                          {...props}
                          {...this.props}
                          tabs={prop.tabs}
                          currentOrganization={currentOrganization}
                          routes={routes}
                          accessDisabled={accessDisabled}
                          userLoginLevel={prop.userLoginLevel}
                          name={prop.name}
                        />
                      </ErrorBoundary>
                    )}
                    key={key}
                  />
                )}
                {children ? (
                  <RouteComp
                    routes={children}
                    accessDisabled={accessDisabled}
                    currentOrganization={currentOrganization}
                    handleChange={this.props.handleChange}
                  />
                ) : null}
              </Switch>
            </React.Fragment>
          );
        })}
      </>
    );
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: [],
    };
  }

  componentDidCatch(error) {
    const { errorMessage } = this.state;

    errorMessage.push(error.stack);

    this.setState({
      hasError: true,
      errorMessage: errorMessage,
    });
  }

  checkUrlOrganization() {
    const { match, currentOrganization, handleChange } = this.props;
    if (match.params.orgId != currentOrganization && match.params.orgId)
      handleChange(match.params.orgId);
  }

  componentDidUpdate() {
    this.checkUrlOrganization();
  }

  componentDidMount() {
    this.checkUrlOrganization();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <Row>
              <Col>Error occured while rendering this page:</Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Row>
              <Col>
                <pre>
                  {this.state.errorMessage.map((txt, index) => (
                    <p key={index}>{txt}</p>
                  ))}
                </pre>
              </Col>
            </Row>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default Content;
