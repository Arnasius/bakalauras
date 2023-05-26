import React from "react";

class Graph extends React.Component {
  render() {
    return (
      <div
        className={
          "graph " +
          (this.props.size !== undefined ? "graph-" + this.props.size : "")
        }
      >
        {this.props.content}
      </div>
    );
  }
}

export default Graph;
