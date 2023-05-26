import { connect } from "react-redux";

let currentRoute = {
  configTab: "",
};

const mapRouteProps = () => {
  return {
    setRoute: (value) => {
      currentRoute = {
        configTab: value,
      };
    },
  };
};

export function RouteControl(Component) {
  return connect(null, mapRouteProps)(Component);
}

export function getRoutePath() {
  return currentRoute.configTab;
}
