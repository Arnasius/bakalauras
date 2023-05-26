import http from "./http";

const URI = "/users";

export function signup(
  username,
  password,
  password2,
  firstname,
  lastname,
  country,
  email,
  rolename,
  orgid
) {
  const options = {
    username,
    password,
    password2,
    firstname,
    lastname,
    country,
    email,
    rolename,
    orgid,
  };

  const response = http.post(URI, options);

  return response;
}

export function checkValidKey(key) {
  const response = http.get(`/user/register/${key}`);

  return response;
}
