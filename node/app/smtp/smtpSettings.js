const db = require("../db");
const config = require("../config/path.config");
const { cacheInstance } = require("../services/node-cache");

const query = `SELECT smtp, smtp_user, smtp_pass, smtp_host,
smtp_port, smtp_email, domain, sslstatus FROM serverInfo WHERE serverid = $1`;

async function query_smtp() {
  const { rows } = await db.query(query, [config.serverId]);
  return rows[0];
}

async function getSettings() {
  let settings = await cacheInstance().get("serverSettings");
  if (settings !== undefined) {
    return settings;
  } else {
    settings = await query_smtp();
    await cacheInstance().set("serverSettings", settings);
    return settings;
  }
}

async function setSettings() {
  let settings = await query_smtp();
  await cacheInstance().set("serverSettings", settings);
  return settings;
}

module.exports = {
  getSettings,
  setSettings,
};
