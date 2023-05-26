import React from "react";

import MultiField from "components/Fields/MultiField";
import GenericInputField from "components/Fields/GenericInputField";
import { isIpv4_Ipv6Netmask, isIpv4_Ipv6Addr } from "services/validation";
import { GlobalStateWatcher } from "state/globalInfo";

@GlobalStateWatcher
class IpAddressAndNetmask extends React.Component {
  render() {
    const { ipAddressProps, netmaskProps, label, name, networks } = this.props;

    return (
      <MultiField label={label}>
        <GenericInputField
          type="text"
          name={name || "ipAddress"}
          label={label || "IP address"}
          validate={(d) => isIpv4_Ipv6Addr(networks, d)}
          {...ipAddressProps}
        />
        <GenericInputField
          type="text"
          name={name || "netmask"}
          label={label || "Netmask"}
          validate={(d) => isIpv4_Ipv6Netmask(ipAddressProps.value, d)}
          {...netmaskProps}
        />
      </MultiField>
    );
  }
}

export default IpAddressAndNetmask;
