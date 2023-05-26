import React from "react";

function CheckIfTablet(Component) {
  return class ComponentWithScreenWidthTracking extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        isTablet: false,
      };

      this.trackWindowWidth = this.trackWindowWidth.bind(this);
    }

    UNSAFE_componentWillMount() {
      this.trackWindowWidth();
      window.addEventListener("resize", this.trackWindowWidth);
    }

    componentWillUnmount() {
      window.removeEventListener("resize", this.trackWindowWidth);
    }

    trackWindowWidth = () => {
      let width = window.innerWidth;
      const isTablet = width <= 768;
      this.setState({ width });

      if (this.state.isTablet != isTablet) {
        this.setState({ isTablet: isTablet });
      }
    };

    render() {
      const { ...passThroughProps } = this.props;
      return (
        <Component
          isTablet={this.state.isTablet}
          width={this.state.width}
          {...passThroughProps}
        />
      );
    }
  };
}

export default CheckIfTablet;
