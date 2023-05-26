import moment from "moment";
import notify from "services/notify";

const dateFormat = "YYYY-MM-DD HH:mm";

function prependZero(value) {
  let line = "" + value;
  return line.length === 1 ? "0" + line : line;
}

function copyText(id) {
  const target = document.getElementById(id).textContent;
  const el = document.createElement("textarea");

  el.value = target;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  notify.emit("success", "Copied to clipboard");
}

function datetimeStamp() {
  let date = new Date();
  return (
    "" +
    date.getFullYear() +
    prependZero(date.getMonth() + 1) +
    prependZero(date.getDate()) +
    "." +
    prependZero(date.getHours()) +
    prependZero(date.getMinutes()) +
    prependZero(date.getSeconds())
  );
}

function getRoles() {
  return [
    { value: 1, name: "Admin" },
    { value: 2, name: "Editor" },
    { value: 3, name: "Viewer" },
  ];
}

function trimObjectStrings(obj) {
  Object.keys(obj).map(
    (k) =>
      (obj[k] =
        typeof obj[k] == "string" && !k.includes("pass")
          ? obj[k].trim()
          : obj[k])
  );
  return obj;
}

function getRoleName(roleId) {
  return ["Admin", "Editor", "Viewer"][roleId - 1];
}

function sortableIp(ip_address) {
  if (!ip_address) return 0;
  else
    return Number(
      ip_address
        .split(".")
        .map((slice) => `000${slice}`.slice(-3))
        .join("")
    );
}

function secondsFromDate(date) {
  let currentDate = new Date();
  return currentDate.getTime() / 1000 - Date.parse(new Date(date)) / 1000;
}

function returnLabel(key) {
  const EN = {
    deviceid: "Device ID",
    devicemac: "MAC address",
    devicename: "Name",
    serialno: "Serial Number",
    isregistered: "Registered",
    isconnected: "Connected",
    fwversion: "Firmware version",
    meshmode: "Mesh mode",
    heartbeat: "Status",
    meshstatus: "Status",
    meshradio: "Backaul radio",
    meship: "IP address",
    meshupstream: "Upstream device",
    orgname: "Name",
    orgid: "ID",
    createddate: "Created date",
    updateddate: "Updated date",
    description: "Description",
    groupname: "Group Name",
    uptime: "Uptime",
  };

  return EN[key];
}

function getDuration(value) {
  const duration = moment.duration(value, "seconds");
  const { years, days, hours, minutes, seconds } = duration._data;

  if (years) {
    return `${years} years ${days} days`;
  } else if (days) {
    return `${days} days ${hours} hours`;
  } else {
    return `${prependZero(hours)}:${prependZero(minutes)}:${prependZero(
      seconds
    )}`;
  }
}

function formatDateAndTime(value) {
  if (!value) return "";
  return moment.unix(value).format(dateFormat);
}

function dateAndTimeToSeconds(value) {
  if (!value) return "";
  return moment(value, dateFormat).unix();
}

function getRelativeTime(value) {
  if (!value) return "";
  return moment(value * 1000).fromNow();
}

function getHours(value) {
  if (!value) return "";
  const x = Date.now() - value;
  const tempResult = moment.duration(x);
  return Math.floor(tempResult.asHours());
}

function getPrecentage(firstNum, secondNum) {
  return (100 / firstNum) * secondNum;
}

function bytesRange(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function throughputRange(value, name) {
  let rsizes = ["bps", "kbps", "Mbps", "Gbps", "Tbps"];
  const k = 1000;
  let i, rvalue;

  i = value < k ? 0 : Math.floor(Math.log(value) / Math.log(k));
  rvalue = value / Math.pow(k, i);

  rvalue = rvalue.toFixed(rvalue < 10 && i > 0 ? 1 : 0);
  if (rvalue === "0" && name === "UpDown") rsizes[i] = "Mbps";
  return `${rvalue} ${rsizes[i]}`;
}

function convertbpsToMbps(bitsPerSec) {
  return (bitsPerSec / 1000000).toFixed(1);
}

function ethernetSpeed(speed, duplex) {
  if (!speed || !duplex) {
    return "-";
  }

  const sp = speed >= 1000 ? speed / 1000 : speed;
  const unit = speed >= 1000 ? "Gbps" : "Mbps";
  const dup =
    duplex == "half" ? "half duplex" : duplex == "full" ? "full duplex" : "";

  return `${sp} ${unit} ${dup}`;
}

function capitalizeFirstLetter(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMac(value) {
  // remove non alphanumeric characters
  value = value.toUpperCase().replace(/\W/gi, "");
  // insert a colon every two characters except the end of the string
  value = value.replace(/(.{2})(?!$)/g, "$1:");
  if (value.length > 17) value = value.substring(0, 17);

  return value;
}

// returns array as string with values separated a by comma and a space
function arrayToString(arr) {
  return arr.toString().replace(/, /g, ",").replace(/,/g, ", ");
}

function radioLabels(radio) {
  const radios = {
    wifi0: "5GHz radio (IPQ6018)",
    wifi1: "2GHz radio (IPQ6018)",
    wifi2: "5GHz radio (QCN9024)",
  };
  return radios[radio];
}

function radioG(radio) {
  const radios = {
    wifi0: "5G",
    wifi1: "2G",
    wifi2: "5G",
  };
  return radios[radio];
}

export {
  dateFormat,
  trimObjectStrings,
  sortableIp,
  getPrecentage,
  secondsFromDate,
  returnLabel,
  datetimeStamp,
  getDuration,
  getHours,
  formatDateAndTime,
  bytesRange,
  throughputRange,
  ethernetSpeed,
  convertbpsToMbps,
  formatMac,
  arrayToString,
  capitalizeFirstLetter,
  getRelativeTime,
  dateAndTimeToSeconds,
  copyText,
  getRoleName,
  getRoles,
  radioLabels,
  radioG,
};
