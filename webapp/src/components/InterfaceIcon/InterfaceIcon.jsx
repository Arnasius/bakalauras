import React from "react";

import InjectCapabilities from "state/capabilities";
import { interfaceIcon } from "services/filter";

function InterfaceIcon(props) {
  const { name, className, vaps, zones, capabilities, ...passThroughProps } =
    props;

  return (
    <i
      className={
        className ? className : interfaceIcon(name, capabilities, vaps, zones)
      }
      {...passThroughProps}
    />
  );
}

export default InjectCapabilities(InterfaceIcon);
