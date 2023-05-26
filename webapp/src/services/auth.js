import http from "./http";
import { getAllOrgs } from "services/organizations";

let user = null;
const AUTH_URI = "/auth/signin";
const SETUP_URI = "/initial";

function setUser(data) {
  user = data;
  return user;
}

export function getCurrentUser() {
  return user;
}

export function setUserRole(role) {
  user.level = role;
}

export function accessDisabled(accessLevel, rowUserLevel) {
  const userLevel = rowUserLevel || user.level;
  if (user.isSuperAdmin) {
    return false;
  } else if (typeof accessLevel === "undefined" || userLevel <= accessLevel) {
    return false;
  }
  return true;
}

function accessLogin() {
  const user = getCurrentUser();
  if (!user || !user.first_login) return false;
  return true;
}

function isAuthorized() {
  const user = getCurrentUser();
  if (!user) return false;

  return true;
}

function check() {
  return http
    .get(AUTH_URI)
    .then((result) => {
      if (result?.auth == false) return false;
      return setUser(result);
    })
    .catch((error) => {
      throw new Error(error);
    });
}

function initialSetup(data) {
  let postData = data;

  return http
    .post(SETUP_URI, postData)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw error;
    });
}

function login(username, password, key) {
  let postData = {};

  if (key) {
    postData.key = key;
  } else {
    postData.username = username;
    postData.password = password;
  }

  return http
    .post(AUTH_URI, postData)
    .then((result) => {
      setUser(result);
    })
    .then(() => getAllOrgs())
    .catch((error) => {
      throw error;
    });
}

function logout() {
  return http.get("/auth/logout");
}

export default {
  isAuthorized: isAuthorized,
  accessDisabled: accessDisabled,
  check: check,
  login: login,
  getCurrentUser: getCurrentUser,
  accessLogin: accessLogin,
  logout: logout,
  initial: initialSetup,
  setUserRole: setUserRole,
};
