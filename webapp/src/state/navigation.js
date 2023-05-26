import { connect } from "react-redux";
import { attachHandler } from "state";

const navigationState = {
  sidemenuState: false,
};

attachHandler({
  navigation: (state = navigationState, action) => {
    let stateChange;
    switch (action.type) {
      case "SIDEMENU_STATE":
        if (action.state === undefined) {
          stateChange = { sidemenuState: !state.sidemenuState };
        } else {
          stateChange = { sidemenuState: !!action.state };
        }
        return Object.assign({}, state, stateChange);
      default:
        return state;
    }
  },
});

const mapNavigationStateToProps = (state) => {
  // Attached handler ensures config object will be in state object
  let { sidemenuState } = state.navigation;

  return {
    sidemenuState: !!sidemenuState,
  };
};

const mapNavigationDispatchToProps = (dispatch) => {
  return {
    sidemenuToggle: () => {
      dispatch({
        type: "SIDEMENU_STATE",
      });
    },
    sidemenuClose: () => {
      dispatch({
        type: "SIDEMENU_STATE",
        state: false,
      });
    },
  };
};

export function navigationBinding(Component) {
  return connect(
    mapNavigationStateToProps,
    mapNavigationDispatchToProps
  )(Component);
}

export function navigationAction(Component) {
  return connect(null, mapNavigationDispatchToProps)(Component);
}
