import http from "./http";

const URI = "/groups";

const org = true;

export function getGroups() {
  return http.get(`${URI}`, "", org).then((result) => {
    return result;
  });
}

export function getGroup(id) {
  return http.get(`${URI}/${id}`, "", org).then((result) => {
    return result;
  });
}

export function addGroup(data) {
  return http.post(URI, data, org).then((result) => {
    return result;
  });
}

export function editGroup(id, data) {
  return http.post(`${URI}/${id}`, data, org).then((result) => {
    return result;
  });
}

export function deleteGroup(id) {
  return http.delete(`${URI}/${id}`, null, org).catch((err) => {
    console.error(err);
  });
}
