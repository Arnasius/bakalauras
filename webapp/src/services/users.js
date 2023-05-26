import http from "./http";

const URI = "/organizations";

export function getOrgUsers(org) {
  return http.get(URI + `/${org}/users`).then((result) => {
    return result;
  });
}

export function getAllUsers() {
  return http.get("users").then((result) => {
    return result;
  });
}

export function getAllPendingInvites() {
  return http.get("users/pending").then((result) => {
    return result;
  });
}

export function getUserById(id) {
  return http.get("users/" + id).then((result) => {
    return result;
  });
}

export function getOrgUser(org, id) {
  return http.get(URI + `/${org}/users/` + id).then((result) => {
    return result;
  });
}

export function changeRole(org, id, roleid) {
  return http
    .post(URI + `/${org}/users/` + id, { roleid: roleid })
    .then((result) => {
      return result;
    });
}

export function addUser(data) {
  const response = http.post(`/users`, data);

  return response;
}

export function updateUser(data) {
  const response = http.post(`/users/${data.userid}`, data);

  return response;
}

export function invite(data, org) {
  const response = http.post(URI + `/${org}/users`, data);

  return response;
}

export function acceptNewInvitation(data) {
  const response = http.post("/user/register", data);

  return response;
}

export function checkPendingInvites(id) {
  return http.get(`/users/${id}/pending`).then((result) => {
    return result;
  });
}

export function accept(org, id) {
  return http.get(URI + `/${org}/users/${id}/accept`).then((result) => {
    return result;
  });
}

export function decline(org, id) {
  return http.get(URI + `/${org}/users/${id}/decline`).then((result) => {
    return result;
  });
}

export function deleteInvite(id, org, email) {
  const data = { org: org, email: email };
  return http
    .delete(`organizations/${org}/users/${id}/invite`, data)
    .then((result) => {
      return result;
    });
}

export function removeUserFromOrg(orgid, userid) {
  return http
    .delete(`/organizations/${orgid}/users/${userid}`)
    .then((result) => {
      return result;
    });
}

export function updateOwnInfo(data) {
  const response = http.post("/user", data);
  return response;
}

export function resetLink(email) {
  const response = http.post("/user/reset", { email: email });

  return response;
}

export function checkReset(key) {
  return http.get(`/user/reset/${key}`).then((result) => {
    return result;
  });
}

export function updatePassword(data, key) {
  const response = http.post(`/user/reset/${key}`, data);

  return response;
}
