import React from "react";

import InterfaceIcon from "../../InterfaceIcon/InterfaceIcon";
import { getEventDescription } from "./EventDescription";
import { interfaceLabel } from "services/filter";

function linkEventDescription(message, key, propsData) {
  const { vaps, zones, capabilities, event } = propsData;
  let status = "is down";

  if (key === "linkUp") status = "is up";
  if (event.link) {
    const iface = event.link.interface;

    return iface ? (
      <>
        <InterfaceIcon name={iface} vaps={vaps} zones={zones} />{" "}
        {interfaceLabel(iface, capabilities, vaps, zones) + " " + status}
      </>
    ) : (
      <>{message}</>
    );
  } else return <>{message}</>;
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
      return isStation ? (
        <>
          <InterfaceIcon name={vap} vaps={vaps} zones={zones} />{" "}
          {interfaceLabel(vap, capabilities, vaps, zones) +
            " " +
            isStationStatus}{" "}
          ({mac})
        </>
      ) : (
        <>
          Client {mac + " " + connectionStatus}{" "}
          <InterfaceIcon name={vap} vaps={vaps} zones={zones} />{" "}
          {interfaceLabel(vap, capabilities, vaps, zones)}
        </>
      );
    } else return <>{message}</>;
  } else return <>{message}</>;
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

    return (
      <>
        DHCP {action} on{" "}
        <InterfaceIcon name={iface} vaps={vaps} zones={zones} />{" "}
        {interfaceLabel(iface, capabilities, vaps, zones)}
        with IP {ip}
      </>
    );
  } catch (error) {
    return <>DHCP bound</>;
  }
}

export function getEventDescriptionComponent(
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
    case "dhcpBound": {
      return dhcpBoundEventDescription(propsData);
    }
    default: {
      return <>{getEventDescription(event, vaps, isStation, zones)}</>;
    }
  }
}
