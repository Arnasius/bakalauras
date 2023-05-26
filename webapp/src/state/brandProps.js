import React from "react";
import { connect } from "react-redux";
import { attachHandler } from "state";

const brandProps = {};

attachHandler({
  brandProps: (state = brandProps, action) => {
    switch (action.type) {
      case "SET_PROPS":
        return Object.assign({}, action.props);
      default:
        return state;
    }
  },
});

const mapbrandPropsToProps = (state) => {
  // Attached handler ensures block object will be in state object
  return { brandProps: state.brandProps };
};

const mapBlockDispatchToProps = (dispatch) => {
  return {
    setProps: (props) => {
      dispatch({
        type: "SET_PROPS",
        props,
      });
    },
  };
};

export function BrandPropsControl(Component) {
  return connect(null, mapBlockDispatchToProps)(Component);
}

export function BrandPropsWatcher(Component) {
  return connect(mapbrandPropsToProps)(Component);
}

export function BrandProps(Component) {
  class BrandPropsComponent extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const { ...passThroughProps } = this.props;
      return (
        <Component brandProps={this.props.brandProps} {...passThroughProps} />
      );
    }
  }

  function mapStateToProps(state) {
    return { brandProps: state.brandProps };
  }

  return connect(mapStateToProps)(BrandPropsComponent);
}
