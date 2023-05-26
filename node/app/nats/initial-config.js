const db = require("../db");
const nats_proxy = require("../nats/config_proxy");

module.exports.initialConfig = async () => {
  const client = await db.getClient();
  try {
    const organizations = await client.query(
      `
      SELECT orgid FROM organizations
      `
    );
    for (let i = 0; i < organizations.rows.length; i++) {
      await nats_proxy.add_organization(organizations.rows[i].orgid, false);
    }

    const devices = await client.query(
      `
        SELECT orgid, devicemac, nkey, devicename FROM devices WHERE isregistered=true
        `
    );

    for (let i = 0; i < devices.rows.length; i++) {
      if (
        !devices.rows[i].orgid ||
        !devices.rows[i].devicemac ||
        !devices.rows[i].nkey
      ) {
        console.warn(
          `Warning: missing data. ${devices.rows[i].devicename} - skipped.`
        );
      } else {
        await nats_proxy.register_device(
          devices.rows[i].devicemac,
          devices.rows[i].orgid,
          devices.rows[i].nkey,
          false
        );
      }
    }
    await nats_proxy.import_topics(organizations.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
};
