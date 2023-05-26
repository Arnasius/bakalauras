import { connect } from "react-redux";
import { attachHandler } from "state";

const blockState = {
  display: null,
  message: null,
};

attachHandler({
  block: (state = blockState, action) => {
    switch (action.type) {
      case "BLOCK_OFF":
        return Object.assign({}, state, { display: null });
      case "BLOCK_ON":
        return Object.assign({}, state, {
          display: action.display,
          message: action.message,
        });
      default:
        return state;
    }
  },
});

const mapBlockStateToProps = (state) => {
  // Attached handler ensures block object will be in state object
  let { display, message } = state.block;

  return {
    blockType: display,
    blockMessage: message,
  };
};

const mapBlockDispatchToProps = (dispatch) => {
  return {
    blockOff: () => {
      dispatch({
        type: "BLOCK_OFF",
      });
    },
    blockInfo: (message) => {
      dispatch({
        type: "BLOCK_ON",
        display: "info",
        message,
      });
    },
    blockFail: (message) => {
      dispatch({
        type: "BLOCK_ON",
        display: "error",
        message,
      });
    },
  };
};

export function BlockControl(Component) {
  return connect(null, mapBlockDispatchToProps)(Component);
}

export function BlockWatcher(Component) {
  return connect(mapBlockStateToProps)(Component);
}
