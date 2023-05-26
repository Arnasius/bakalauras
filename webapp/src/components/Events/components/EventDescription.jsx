import { interfaceLabel } from "services/filter";

function linkEventDescription(message, key, propsData) {
  const { vaps, zones, capabilities, event } = propsData;
  let status = "is down";

  if (key === "linkUp") status = "is up";
  if (event.link) {
    const iface = event.link.interface;
    return iface
      ? `${interfaceLabel(iface, capabilities, vaps, zones) + " " + status}`
      : message;
  } else return message;
}

function wirelessPeerEventDescription(message, key, propsData) {
  const { vaps, zones, capabilities, event, isStation } = propsData;
  let isStationStatus = "disconnected from access point";
  let connectionStatus = "disconnected from";

  if (key === "wirelessPeerAssoc") {
    isStationStatus = "connected to access point";
    connectionStatus = "connected to";
  }

  if (event.wireless_peer) {
    const { mac, vap } = event.wireless_peer;

    if (mac && vap && isStation !== null) {
      return isStation
        ? `${interfaceLabel(
            vap,
            capabilities,
            vaps,
            zones
          )} ${isStationStatus} (${mac})`
        : `Client ${
            mac +
            connectionStatus +
            interfaceLabel(vap, capabilities, vaps, zones)
          }`;
    } else return message;
  } else return message;
}

function managementAuthEventDescription(message, event) {
  if (event.management_auth) {
    const { address, method, username } = event.management_auth;

    return address && method
      ? `${message} from ${address} over ${method} by ${username}`
      : message;
  } else {
    return message;
  }
}

function dhcpBoundEventDescription(propsData) {
  const { vaps, zones, capabilities, event } = propsData;
  try {
    const iface = event.dhcp.interface;
    let { ip, action } = event.dhcp;

    switch (action) {
      case "bind":
        action = "bound";
        break;
      case "renew":
        action = "renewed";
        break;
    }

    return `DHCP ${action} on ${interfaceLabel(
      iface,
      capabilities,
      vaps,
      zones
    )} with IP ${ip}`;
  } catch (error) {
    return "DHCP bound";
  }
}

function configChangeEventDescription(message, event) {
  if (event.config) {
    const { option, value, change } = event.config;

    if (!option) return message;

    if (change == "add") {
      return `Configuration option (${option}) added`;
    } else if (change == "remove") {
      return `Configuration option (${option}) removed`;
    } else if (change == "redact") {
      return `Configuration option (${option}) changed`;
    } else if (change == "change") {
      return `Configuration option (${option}) changed to ${value}`;
    } else {
      return message;
    }
  } else return message;
}

export function getEventDescription(
  event,
  vaps,
  isStation,
  zones,
  capabilities
) {
  const propsData = {
    event,
    vaps,
    isStation,
    zones,
    capabilities,
  };
  switch (event.name) {
    case "linkUp": {
      const message = "Link is up";
      return linkEventDescription(message, "linkUp", propsData);
    }
    case "linkDown": {
      const message = "Link is down";
      return linkEventDescription(message, "linkDown", propsData);
    }
    case "wirelessPeerAssoc": {
      const message = "Client connected";
      return wirelessPeerEventDescription(
        message,
        "wirelessPeerAssoc",
        propsData
      );
    }
    case "wirelessPeerDisassoc": {
      const message = "Client disconnected";
      return wirelessPeerEventDescription(
        message,
        "wirelessPeerDisassoc",
        propsData
      );
    }
    case "managementAuthFail": {
      const message = "Failed management authentication";
      return managementAuthEventDescription(message, event);
    }
    case "managementAuthSuccess": {
      const message = "Successful management authentication";
      return managementAuthEventDescription(message, event);
    }
    case "dhcpBound": {
      return dhcpBoundEventDescription(propsData);
    }
    case "configChange": {
      const message = "Configuration changed";
      return configChangeEventDescription(message, event);
    }
    case "configFail":
      return "Configuration failed";
    case "configBackup":
      return "Configuration backup executed";
    case "configReset":
      return "Configuration reset by user";
    case "coldBoot":
      return "Device rebooted";
    case "peerDetect":
      return "Wireless peer detected";
    case "linkQualityLow":
      return "Link quality below limit";
    case "linkQualityLowClear":
      return "Link quality back to normal";
    case "handshakeFail":
      return "Peer handshake failed";
    default:
      return event.desc;
  }
}
