import React, { Component } from "react";

export default class ScrollToTop extends Component {
  constructor(props) {
    super(props);
    const element = document.getElementsByClassName("wrapper")[0];
    this.state = {
      element,
      height: element?.scrollTop,
    };

    this.scrollToTop = this.scrollToTop.bind(this);
    this.listenScrollEvent = this.listenScrollEvent.bind(this);
  }

  listenScrollEvent(element) {
    if (this.state.height !== element.scrollTop) {
      this.setState({ height: element.scrollTop });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const element = document.getElementsByClassName("wrapper")[0];
    if (this.state.element !== element) this.setState({ element });

    if (!prevState.element && this.state?.element) {
      element?.addEventListener("scroll", () =>
        this.listenScrollEvent(element)
      );
    }
  }

  scrollToTop() {
    const { element } = this.state;

    element.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  render() {
    const className = this.state.height > 50 ? "" : "d-none";
    return (
      <div onClick={this.scrollToTop} className={className}>
        <i className="now-ui-icons arrows-1_minimal-up bg-white rounded-circle border scroll-to-top" />
      </div>
    );
  }
}
