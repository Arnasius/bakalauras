const WS_URI = "/ws";
const WS_TIMEOUT = 500; //ms
const WS_TIMEOUT_MAX = 60 * 1000; //1min

var ws;
var wsConnectAttempts;
var wsConnectTimeout;
var wsDisconnectStay;
var wsListeners = {};
// Exponential Backoff Formula by Prof. Douglas Thain
// http://dthain.blogspot.co.uk/2009/02/exponential-backoff-in-distributed.html
function getBackoffDelay(attempt) {
  var R = Math.random() + 1;
  var T = WS_TIMEOUT;
  var F = 2;
  var N = attempt;
  var M = WS_TIMEOUT_MAX;

  return Math.floor(Math.min(R * T * Math.pow(F, N), M));
}

function buildUrl(uri) {
  let protocol = window.location.protocol.replace("http", "ws") + "//";
  let address = window.location.host;
  if (!uri.startsWith("/")) uri = "/" + uri;
  return protocol + address + uri;
}

function disconnect() {
  wsDisconnectStay = true;
  /* Cancel reconnect if requested. */
  if (wsConnectTimeout) {
    clearTimeout(wsConnectTimeout);
    wsConnectTimeout = null;
  }

  if (!ws) return;

  ws.close(1000);
  ws = null;
}

function connect() {
  if (ws) return;
  wsDisconnectStay = false;
  /* Cleanup timeout if retried. */
  if (wsConnectTimeout) {
    clearTimeout(wsConnectTimeout);
    wsConnectTimeout = null;
  }
  wsConnectAttempts = 0;
  ws = new WebSocket(buildUrl(WS_URI));
  ws.onopen = function () {
    // TODO
  };

  ws.onclose = function (event) {
    if (event.code === 1000) return;

    /* Skip reconnect when intentional close or repeated close event. */
    if (wsDisconnectStay || wsConnectTimeout) return;

    ws = null;

    var delay = getBackoffDelay(++wsConnectAttempts);
    console.info("Reconnecting in " + delay / 1000 + " seconds");
    wsConnectTimeout = setTimeout(connect, delay);
  };

  ws.onerror = function (event) {
    console.error("Connection error: ", event.message, "Socket closed");
    ws = null;
  };

  ws.onmessage = function (event) {
    notify("message", JSON.parse(event.data) || {});
  };
}

function listen(key, listener) {
  Object.keys(listener).forEach((target) => {
    let handler = listener[target];
    switch (target) {
      case "connect":
      case "disconnect":
      case "message":
        break;
      default:
        throw new Error(`Unknown listener target: ${target}`);
    }
    if (typeof handler !== "function")
      throw new Error(
        `Invalid listener target type: ${typeof handler} (${target})`
      );
  });

  wsListeners[key] = listener;
}

function notify(type, data) {
  Object.keys(wsListeners).forEach(function (key) {
    if (wsListeners?.[key]?.[type]) wsListeners[key][type](data);
  });
}

export default {
  connect,
  disconnect,
  listen,
};
