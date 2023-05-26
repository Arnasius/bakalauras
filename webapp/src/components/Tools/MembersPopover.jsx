import React from "react";
import { UncontrolledPopover, PopoverBody } from "reactstrap";

export default function MembersPopover(props) {
  return (
    <UncontrolledPopover
      placement="bottom"
      target={props.id}
      boundariesElement={"#" + props.id}
      className="popover-members popover-md"
      trigger="legacy"
    >
      <PopoverBody className="network-members">{props.members}</PopoverBody>
    </UncontrolledPopover>
  );
}
