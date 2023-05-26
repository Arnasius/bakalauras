import http from "./http";
import browserStorage from "services/browserStorage";
import { setUserRole } from "./auth";

const URI = "/organizations";
let currentOrganization = null;
let allOrganizations = [];

export function getAllOrgs() {
  return http.get(URI).then((result) => {
    let savedOrgranization = browserStorage.get("currentOrganization");
    const found = result.some((el) => el.orgid === savedOrgranization);
    const orgid = found ? savedOrgranization : result[0]?.orgid;
    currentOrganization = orgid;
    setCurrentOrganization(orgid);
    allOrganizations = result;
    setUserRole(result.find((o) => o.orgid === orgid)?.roleid);
    return result;
  });
}

export function getOrg(id) {
  const orgId = id ? id : currentOrganization;
  return http.get(URI + "/" + orgId).then((result) => {
    return result;
  });
}

export function deleteOrg(id) {
  return http.delete(URI + "/" + id).then((result) => {
    return result;
  });
}

export function addOrg(data) {
  return http.post(URI + "/", data).then((result) => {
    return result;
  });
}
export function editOrg(id, data) {
  return http.post(URI + "/" + id, data).then((result) => {
    return result;
  });
}

export function getCurrentOrganization() {
  return currentOrganization;
}

export function getOrgs() {
  return allOrganizations;
}

export function setCurrentOrganization(orgId) {
  currentOrganization = orgId;
  browserStorage.set("currentOrganization", orgId);
  setUserRole(
    allOrganizations.filter((item) => item.orgid == orgId)[0]?.roleid
  );
}
