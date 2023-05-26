const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const config = require("./config/auth.config.js");

function getTokensFromCookie(cookie) {
  if (
    !cookie ||
    !cookie.includes("serverToken") ||
    !cookie.includes("clientToken")
  )
    return false;
  let tokens = cookie.split("; ");
  let serverToken, clientToken;
  for (const token of tokens) {
    if (token.includes("serverToken"))
      serverToken = token.replace("serverToken=", "").replace(" ", "");
    if (token.includes("clientToken"))
      clientToken = token.replace("clientToken=", "").replace(" ", "");
  }
  return { serverToken: serverToken, clientToken: clientToken };
}

function auth(clientToken, serverToken) {
  if (serverToken == undefined || clientToken == undefined) return false;
  else {
    try {
      jwt.verify(clientToken, config.clientSecret);
      jwt.verify(serverToken, config.serverSecret);
    } catch (err) {
      return false;
    }
  }
  return true;
}

module.exports = function (server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    if (!getTokensFromCookie(req.headers.cookie)) return ws.terminate();
    else {
      let { serverToken, clientToken } = getTokensFromCookie(
        req.headers.cookie
      );
      if (!auth(clientToken, serverToken)) {
        return ws.terminate();
      }
    }

    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.send(JSON.stringify({ message: "ping" }));
      ws.isAlive = false;
      ws.ping(null, false, true);
    });
  }, 5000);
};
