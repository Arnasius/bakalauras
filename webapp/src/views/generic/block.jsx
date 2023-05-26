import React from "react";

import { BlockWatcher } from "state/block";
import Block from "components/Block";

@BlockWatcher
export default class BlockScreen extends React.Component {
  render() {
    return (
      <Block isOpen={!!this.props.blockType}>
        <br />
        <center>{this.props.blockMessage}</center>
        <br />
      </Block>
    );
  }
}
