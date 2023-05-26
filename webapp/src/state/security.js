import { connect } from "react-redux";
import { attachHandler } from "state";
import auth from "../services/auth";

const securityState = {
  allowed: null,
};

attachHandler({
  security: (state = securityState, action) => {
    switch (action.type) {
      case "AUTH_CHANGED":
        return Object.assign({}, state, { allowed: !!action.status });
      default:
        return state;
    }
  },
});

const mapSecurityStateToProps = (state) => {
  // Attached handler ensures config object will be in state object
  const { allowed } = state.security;

  return {
    securityAllowed: !!allowed,
    accessLogin: auth.accessLogin(),
  };
};

const mapSecurityDispatchToProps = (dispatch) => {
  return {
    setAuthState: (status) => {
      dispatch({
        type: "AUTH_CHANGED",
        status,
      });
    },
  };
};

export function SecurityManager(Component) {
  return connect(
    mapSecurityStateToProps,
    mapSecurityDispatchToProps
  )(Component);
}

export function SecurityAction(Component) {
  return connect(null, mapSecurityDispatchToProps)(Component);
}
