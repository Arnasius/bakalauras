import React from "react";
import PropTypes from "prop-types";

export class ClosureComponent extends React.Component {
  constructor(props) {
    super(props);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClick(event) {
    //close open wrapper when clicked outside of the component
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.toggle(false);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick);
  }

  render() {
    return <div ref={this.setWrapperRef}> {this.props.children} </div>;
  }
}

ClosureComponent.propTypes = {
  children: PropTypes.element.isRequired,
};
