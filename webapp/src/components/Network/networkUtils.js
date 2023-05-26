import React from "react";
import { interfaceIcon, interfaceLabel } from "services/filter";

function getNetworkDescriptionComponent(data, capabilities, vaps, zones) {
  return (
    <>
      <i
        className={`${interfaceIcon(
          data,
          capabilities,
          vaps,
          zones
        )} align-middle mr-1`}
      />
      {interfaceLabel(data, capabilities, vaps, zones)}
    </>
  );
}

export { getNetworkDescriptionComponent };
