import React from "react";

import { SecurityManager } from "state/security";
import http from "services/http";
import auth from "services/auth";
import Login from "./login";
import Initial from "./initial";
import Registration from "./registration";
import ResetPassword from "./resetPassword";
@SecurityManager
export class Security extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initial: false,
    };
  }

  render() {
    if (window.location.hash.includes("invite="))
      return <Registration hash={window.location.hash} />;
    if (window.location.hash.includes("reset")) {
      return <ResetPassword hash={window.location.hash} />;
    }
    if (this.props.securityAllowed === null) return null;
    if (this.state.initial) {
      window.history.replaceState({}, document.title, "/");
      return <Initial />;
    }
    if (this.props.securityAllowed && !this.props.accessLogin) {
      return this.props.children;
    }
    if (!this.props.securityAllowed) {
      return <Login />;
    }
  }

  componentDidMount() {
    auth
      .check()
      .then((res) => {
        if (res.initial) {
          this.setState({ initial: res.initial });
        } else {
          this.props.setAuthState(auth.isAuthorized());
        }
      })
      .catch((err) => {
        console.error(err);
      });

    http.intercept({
      responseError: (response) => {
        if (response.status === 401) this.props.setAuthState(false);
        return Promise.reject(response);
      },
    });
  }
}
