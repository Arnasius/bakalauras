import React from "react";
import { Button, FormGroup } from "reactstrap";

import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import Spinner from "components/Tools/Spinner";

import { BlockControl } from "state/block";

import auth from "services/auth";
import { SecurityAction } from "state/security";
import { resetLink } from "services/users";
import { checkSmtp } from "services/server";

@SecurityAction
@BlockControl
export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      loading: false,
      error: null,
      reset: false,
      email: "",
      message: null,
    };

    this.userRef = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetPage = this.resetPage.bind(this);
    this.resetSubmit = this.resetSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    const { username, password, loading, error, reset, email, message } =
      this.state;
    return !reset ? (
      <form
        autoComplete="on"
        className="login-form"
        onSubmit={this.handleSubmit}
      >
        <div className="logo">
          <a href="#" className="simple-text logo-mini">
            <div className="logo-img"></div>
          </a>
        </div>
        <FormGroup tag="fieldset">
          <div className="form-title">Sign In</div>
          <GenericInputField
            type="text"
            name="username"
            value={username}
            onChange={this.handleChange}
            innerRef={this.userRef}
            autoComplete="username"
            placeholder="Username"
          />
          <SecretField
            name="password"
            value={password}
            onChange={this.handleChange}
            autoComplete="current-password"
            placeholder="Password"
          />
          {error ? <p className="error-message">{error}</p> : null}
          <div className="pull-right">
            {loading ? (
              <Spinner className="px-0" />
            ) : (
              <Button type="submit" color="primary">
                Log In
              </Button>
            )}
          </div>
          <div>
            <a onClick={this.resetPage}>Forgot password?</a>
          </div>
        </FormGroup>
      </form>
    ) : (
      <form
        autoComplete="on"
        className="login-form"
        onSubmit={this.resetSubmit}
      >
        <div className="logo">
          <a href="#" className="simple-text logo-mini">
            <div className="logo-img"></div>
          </a>
        </div>
        <FormGroup tag="fieldset">
          <div className="form-title">Password reset</div>
          <GenericInputField
            type="text"
            name="email"
            value={email}
            onChange={this.handleChange}
            innerRef={this.userRef}
            autoComplete="email"
            placeholder="Email"
          />
          {error ? <p className="error-message">{error}</p> : null}
          {message ? <p className="text-success">{message}</p> : null}
          <div className="pull-right">
            {loading ? (
              <Spinner className="px-0" />
            ) : (
              <Button color="primary">Reset</Button>
            )}
          </div>
          <div className="pull-left">
            <Button onClick={this.resetPage} color="neutral">
              <i className="now-ui-icons arrows-1_minimal-left" />
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }

  handleChange(event) {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  }
  handleSubmit(event) {
    const { username, password } = this.state;
    const { setAuthState } = this.props;

    this.setState({ loading: true, error: null });
    event.preventDefault();

    window.history.replaceState({}, document.title, "/");

    auth.login(username, password).then(
      () => {
        this.props.blockOff();
        setAuthState(auth.isAuthorized());
      },
      (err) => {
        this.setState({
          username: "",
          password: "",
          loading: false,
          error: String(err).replace("Error: ", ""),
        });
        this.userRef.current.focus();
      }
    );
  }

  resetPage() {
    const { reset } = this.state;
    this.setState({ reset: !reset, error: null, message: null });
  }

  resetSubmit(event) {
    const { email } = this.state;

    this.setState({ loading: true, error: null, message: null, email: "" });
    event.preventDefault();

    checkSmtp().then((result) => {
      if (result.enabled) {
        resetLink(email)
          .then(() => {
            this.setState({
              loading: false,
              message: "Reset link has been sent!",
              email: "",
            });
          })
          .catch((err) => {
            this.setState({ loading: false, error: err.message });
          });
      } else {
        this.setState({
          loading: false,
          error: "Contact the administrator to reset your password.",
          email: "",
        });
      }
    });
  }
}
