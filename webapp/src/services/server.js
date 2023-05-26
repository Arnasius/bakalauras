import http from "./http";
const URI = "/server";

export function getInfo() {
  return http
    .get(URI)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(error);
    });
}

export function updateInfo(data) {
  const response = http.post(URI, data);

  return response;
}

export function checkSmtp() {
  return http.get(URI + "/smtp").then((result) => {
    return result;
  });
}

export function getFirmwares() {
  return http.get(URI + "/firmwares").then((result) => {
    return result;
  });
}

export function deleteFirmware(id, filename) {
  return http.delete(`${URI}/firmwares/${id}/${filename}`).catch((err) => {
    console.error(err);
  });
}
