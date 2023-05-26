import http from "./http";

export function deleteUser(id) {
  const body = { userid: id };
  const response = http.delete(`/users/${id}`, body);
  return response;
}
