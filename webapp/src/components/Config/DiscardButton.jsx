import React from "react";
import { Button } from "reactstrap";

import notify from "services/notify";

export default class DiscardButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    const { title } = this.props;
    return (
      <Button color="outlined" onClick={this.handleClick}>
        {title ? title : "Discard"}
      </Button>
    );
  }

  handleClick() {
    notify.emit("error", "Configuration cannot be reverted");
    this.props.navigate ? this.props.navigate() : null;
  }
}
