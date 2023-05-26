import http from "./http";
import { getCurrentOrganization } from "services/organizations";

const URI = "/devices";

const org = true;

export function getDevices(groupId) {
  return http.get(`groups/${groupId}${URI}`, "", org).then((result) => {
    return result;
  });
}

export function rebootDevice(deviceId, groupId, deviceMac) {
  return http
    .post(
      `groups/${groupId}/devices/${deviceId}/reboot`,
      { deviceMac: deviceMac },
      org
    )
    .then((result) => {
      return result;
    });
}

export function upgradeDevice(
  deviceId,
  groupId,
  checksum,
  filename,
  deviceMac
) {
  return http
    .post(
      `groups/${groupId}/devices/${deviceId}/upgrade`,
      {
        checksum: checksum,
        filename: filename,
        deviceMac: deviceMac,
      },
      org
    )
    .then((result) => {
      return result;
    });
}

export function resetDeviceToDefaults(deviceId, groupId, deviceMac) {
  return http
    .post(
      `groups/${groupId}/devices/${deviceId}/config_reset`,
      { deviceMac: deviceMac },
      org
    )
    .then((result) => {
      return result;
    });
}

export function getDevice(groupId, id) {
  return http.get(`groups/${groupId}${URI}/${id}`, "", org).then((result) => {
    return result;
  });
}

export function getUnregisteredDevice(org, id) {
  return http
    .get(`organizations/${org}/devices/unregistered/${id}`)
    .then((result) => {
      return result;
    });
}

export function getPendingDevices() {
  return http.get(`${URI}/unregistered`, "", org).then((result) => {
    return result;
  });
}

export function addDevice(groupId, data) {
  return http.post(`groups/${groupId}${URI}`, data, org).then((result) => {
    return result;
  });
}

export function registerDevice(id, data) {
  return http.post(`${URI}/unregistered/${id}`, data, org).then((result) => {
    return result;
  });
}

export function editDevice(groupId, id, data) {
  return http
    .post(`groups/${groupId}${URI}/${id}`, data, org)
    .then((result) => {
      return result;
    });
}

export function deleteDevice(id, resetConfig, deviceMac) {
  return http
    .delete(`${URI}/${id}`, { resetConfig, deviceMac }, org)
    .then((result) => {
      return result;
    });
}

export function getDeviceInfo(org, userId, groupId) {
  return http
    .get(`organizations/${org}/groups/${groupId}/devices/${userId}/info`)
    .then((result) => {
      return result;
    });
}

export function getOrganizationDevices() {
  return http
    .get(`organizations/${getCurrentOrganization()}/devices`)
    .then((result) => {
      return result;
    });
}

export function getGraphData(mac, interval, data) {
  return http
    .get(
      `organizations/${getCurrentOrganization()}/device/${mac}/${interval}/${data}`
    )
    .then((result) => {
      return result;
    });
}
