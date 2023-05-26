const EMAIL_REGEXP = RegExp(
  /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/
);
const USERNAME_REGEXP = new RegExp(/^[A-Za-z0-9_-]*$/);

const MAC_REGEXP = new RegExp("^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$");

function isValueSelected(data) {
  if (data === "" || data === null) {
    return "Please select a value";
  }
}

function isRequired(data) {
  if (!data) return "Required";
}

function isValueAvailable(value, availableValues) {
  if (!availableValues.includes(value)) {
    return "Value does not match any available values";
  }
}

function isString(data, min, max) {
  data = data ? data.toString() : "";
  if (data.length < min || data.length > max)
    return `Must be ${min}-${max} symbols long`;
}

function isTextAndNumberOnly(data) {
  if (!USERNAME_REGEXP.test(data)) return "Special characters are not allowed";
}

function isEmail(data) {
  if (!EMAIL_REGEXP.test(data)) return "Invalid Email address";
}

function isPassword(data) {
  if (isString(data, 5, 100)) return isString(data, 5, 100);
}

function matchPassword(value, password) {
  if (value !== password) return "Passwords do not match";
}

function isValueAlreadyInUse(name, value, valueArray) {
  if (valueArray.filter((val) => val == value).length > 1) {
    throw Error(`${name} already in use`);
  }
}

function isMac(data) {
  if (!MAC_REGEXP.test(data)) return "Invalid MAC address";
}

function isPort(data) {
  if (data < 1 || 65535 < data) return "Port must be in range 1 - 65535";
}

export {
  isValueSelected,
  isValueAvailable,
  isPassword,
  isEmail,
  matchPassword,
  isValueAlreadyInUse,
  isString,
  isTextAndNumberOnly,
  isMac,
  isRequired,
  isPort,
};
