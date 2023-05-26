const db = require("../db");
const {
  validateData,
  formSingleUpdateQuery,
  deviceStatus,
} = require("../services/utils");
const nats_proxy = require("../nats/config_proxy");
const { publish_json } = require("../nats/client");
const { getSettings } = require("../smtp/smtpSettings");

exports.reboot = (req, res) => {
  const { org } = req.params;
  const subj = `v1.organization.${org}.device.${req.body.deviceMac.toUpperCase()}.reboot`;
  publish_json(subj, { reboot: {} })
    .then(() => {
      res.status(200).send({ message: "Rebooting device" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.upgrade = async (req, res) => {
  const { deviceId } = req.params;
  const { checksum, filename } = req.body;
  const subj = `firmware`;
  const smtp = await getSettings();
  if (!smtp.smtp || !smtp.domain) {
    res.status(500).send({ message: "Unknown domain name" });
  }

  const proto = smtp.sslstatus ? "https" : "http";
  const link = `${proto}://${smtp.domain}/firmwares/${filename}`;

  publish_json(subj, {
    deviceid: parseInt(deviceId),
    firmware: {
      url: link,
      checksum: checksum,
    },
  })
    .then(() => {
      const timeStamp = new Date().toISOString();
      const updateDate = {
        firmware_status: "started",
        firmware_updated_time: timeStamp,
        deviceid: deviceId,
      };

      const query = formSingleUpdateQuery(updateDate, "devices", ["deviceid"]);
      db.query(query[0], query[1])
        .then(() => {
          res.status(200).send({ message: "Upgrading device started!" });
        })
        .catch((err) => {
          res.status(400).send({ message: err.message });
        });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.get = async (req, res) => {
  const { id, groupId, org } = req.params;
  if (id) {
    await db
      .query(
        `SELECT devices.deviceid, devices.heartbeat, devices.configseq, devices.config, devices.devicename, devices.devicemac, devices.fwversion, devices.groupid, devices.meshmode, devices.board, deviceInfo.ip_address, devices.firmware_status, devices.firmware_updated_time FROM devices 
        LEFT JOIN deviceInfo ON devices.deviceId = deviceInfo.deviceId
        WHERE devices.deviceId = $1 AND devices.groupId = $2 AND devices.orgId = $3 AND devices.isregistered = true`,
        [id, groupId, org]
      )
      .then((result) => {
        res.status(200).send(deviceStatus(result.rows)[0]);
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  } else {
    await db
      .query(
        `SELECT devices.deviceid, devices.configseq,  devices.devicemac, devices.devicename, devices.isregistered, devices.fwversion, devices.heartbeat, devices.meshmode, devices.board, deviceInfo.ip_address, devices.firmware_status, devices.firmware_updated_time FROM devices 
        LEFT JOIN deviceInfo ON devices.deviceId = deviceInfo.deviceId
        WHERE devices.groupId = $1 AND devices.orgId = $2 AND devices.isregistered = true`,
        [groupId, org]
      )
      .then((result) => {
        res.status(200).send(deviceStatus(result.rows));
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  }
};

exports.getStats = async (req, res) => {
  const { deviceId } = req.params;
  await db
    .query(
      `SELECT updateddate, cpuusage, totalmemory, usedmemory, location, uptime, 
    wifi0mac, wifi0channel, wifi0chwidth, wifi0txpower, wifi1mac, wifi1channel, 
    wifi1chwidth, wifi1txpower, wifi2mac, wifi2channel, wifi2chwidth, wifi2txpower, 
    meshactive, meshstatus, meshradio, meship, meshmode, meshupstream, meshneighbors, vaps
    FROM deviceinfo WHERE deviceId = $1
    ORDER BY updateddate DESC LIMIT 1`,
      [deviceId]
    )
    .then((result) => res.status(200).send(result.rows[0]))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.getUnregistered = async (req, res) => {
  if (req.params.id) {
    await db
      .query(
        "SELECT deviceid, devicemac, devicename, isregistered, isconnected, fwversion FROM devices WHERE deviceId = $1 AND orgId = $2 AND isregistered = false",
        [req.params.id, req.params.org]
      )
      .then((result) => res.status(200).send(result.rows[0]))
      .catch((err) => res.status(500).send({ message: err.message }));
  } else {
    await db
      .query(
        "SELECT deviceid, devicemac, devicename, isregistered, fwversion, lastintro, board FROM devices WHERE orgId = $1 AND isregistered = false",
        [req.params.org]
      )
      .then((result) => res.status(200).send(result.rows))
      .catch((err) => res.status(500).send({ message: err.message }));
  }
};

exports.getGraphData = async (req, res) => {
  const { mac, interval, data } = req.params;
  let sqlString;
  const validDataArr = [
    "clientcount",
    "healthyclients",
    "cpuusage",
    "memoryusage",
    "throughputtx",
    "throughputrx",
    "clientthroughputtx",
    "clientthroughputrx",
    "clienttxbytes",
    "clientrxbytes",
    "avg_client_count",
    "min_client_count",
    "max_client_count",
    "avg_healthy_client_count",
    "min_healthy_client_count",
    "max_healthy_client_count",
    "avg_cpu_usage",
    "avg_memory_usage",
    "min_memory_usage",
    "max_memory_usage",
    "avg_throughput_tx",
    "min_throughput_tx",
    "max_throughput_tx",
    "avg_throughput_rx",
    "min_throughput_rx",
    "max_throughput_rx",
    "avg_clientthroughput_tx",
    "min_clientthroughput_tx",
    "max_clientthroughput_tx",
    "avg_clientthroughput_rx",
    "min_clientthroughput_rx",
    "max_clientthroughput_rx",
    "max_client_tx_bytes",
    "max_client_rx_bytes",
  ];
  const dataArr = data.toLowerCase().split(",");
  let validData = dataArr.filter((element) => validDataArr.includes(element));
  validData = validData.join(", ");

  const sqlStringInstantStart = `SELECT time, `;
  const sqlStringAggStart = `SELECT bucket, `;

  const sqlStringInstant = ` FROM devicestats WHERE  devicemac = $1 AND time >  now() - INTERVAL '1 hour' ORDER BY time;`;
  const sqlString1 = ` FROM device_stats_10minutes WHERE devicemac = $1 AND bucket > now() - INTERVAL '1 day' ORDER BY bucket;`;
  const sqlString2 = ` FROM device_stats_hour WHERE devicemac = $1 AND bucket > now() - INTERVAL '1 week' ORDER BY bucket;`;
  const sqlString3 = ` FROM device_stats_6hours WHERE devicemac = $1 AND bucket > now() - INTERVAL '2 weeks' ORDER BY bucket;`;
  const sqlString4 = ` FROM device_stats_6hours WHERE devicemac = $1 AND bucket > now() - INTERVAL '1 month' ORDER BY bucket;`;

  switch (interval) {
    case "instant":
      sqlString = sqlStringInstantStart + validData + sqlStringInstant;
      break;
    case "interval1":
      sqlString = sqlStringAggStart + validData + sqlString1;
      break;
    case "interval2":
      sqlString = sqlStringAggStart + validData + sqlString2;
      break;
    case "interval3":
      sqlString = sqlStringAggStart + validData + sqlString3;
      break;
    case "interval4":
      sqlString = sqlStringAggStart + validData + sqlString4;
      break;
  }

  await db
    .query(sqlString, [mac])
    .then((result) => res.status(200).send(result.rows))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.add = (req, res) => {
  if (req.params.id) {
    const validKeyNames = [
      "devicename",
      "meshmode",
      "groupid",
      "deviceid",
      "orgid",
    ];
    const data = {
      ...req.body,
      ...{ deviceid: req.params.id, orgid: req.params.org },
    };

    if (!validateData(data, validKeyNames)) {
      res.status(400).send({ message: "Data was rejected. Please try again." });
      return;
    }

    const query = formSingleUpdateQuery(data, "devices", ["deviceid", "orgid"]);
    db.query(query[0], query[1])
      .then(() => {
        res.status(200).send({ message: "Update successful!" });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } else {
    let { devicemac, devicename, meshmode } = req.body;
    if (!devicemac) {
      res.status(500).send({ message: "Enter all fields" });
      return;
    }

    db.query(
      `
        INSERT INTO devices (deviceMac, devicename, isRegistered, isConnected, groupid, orgId, status, meshmode)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING deviceId, nkey
      `,
      [
        devicemac.toLowerCase(),
        devicename,
        true,
        false,
        req.params.groupId,
        req.params.org,
        false,
        meshmode,
      ]
    )
      .then(() => {
        res.status(200).send({ message: "Device added successfully!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.getOrganizationDevices = async (req, res) => {
  const client = await db.getClient();

  try {
    const resultClients = await client.query(
      `
      SELECT devices.deviceid, deviceinfo.clientCount, deviceinfo.healthyclients
      FROM devices
      LEFT JOIN groups ON devices.groupId = groups.groupId
      LEFT JOIN deviceInfo ON devices.deviceId = deviceInfo.deviceId
      WHERE devices.orgId = $1 AND devices.heartbeat > now() - INTERVAL '5 minutes'; 

        `,
      [req.params.org]
    );
    const resultData = await client.query(
      `SELECT devices.deviceId, devices.deviceMac, devices.deviceName, 
        devices.isRegistered, devices.isconnected, devices.groupid, deviceInfo.clientthroughputtx, deviceInfo.clientthroughputrx, 
        deviceInfo.clienttxbytes, deviceInfo.clientrxbytes,
        devices.heartbeat, devices.meshMode, devices.board, groups.groupName, deviceInfo.ip_address
        FROM devices
        LEFT JOIN groups ON devices.groupId = groups.groupId
        LEFT JOIN deviceInfo ON devices.deviceId = deviceInfo.deviceId
        WHERE devices.orgId = $1`,
      [req.params.org]
    );

    let merged = [];

    for (let i = 0; i < resultData.rows.length; i++) {
      merged.push({
        ...resultData.rows[i],
        ...resultClients.rows.find(
          (itmInner) => itmInner.deviceid === resultData.rows[i].deviceid
        ),
      });
    }

    res.status(200).send(deviceStatus(merged));
  } catch (e) {
    res.status(500).send(e.message);
  } finally {
    client.release();
  }
};

exports.addUnregistered = async (req, res) => {
  const validKeyNames = ["devicename", "groupid", "meshmode"];
  const data = req.body;
  if (!validateData(data, validKeyNames)) {
    res.status(400).send({ message: "Data was rejected. Please try again." });
    return;
  } else if (!data.groupid) {
    res.status(400).send({ message: "Group can't be null." });
    return;
  }
  const client = await db.getClient();
  try {
    await client.query(`BEGIN`);
    const result = await client.query(
      `
      SELECT isRegistered FROM devices WHERE deviceid = $1
      `,
      [req.params.id]
    );

    if (result.rows[0].isregistered) {
      res.status(400).send({ message: "Device was alredy registered." });
      throw new Error();
    }

    await client
      .query(
        `UPDATE devices SET (devicename, groupid, meshmode, isRegistered) = ($1, $2, $3, $4) WHERE deviceId=$5 AND orgId=$6 RETURNING deviceMac, nkey`,
        [
          data.devicename,
          data.groupid,
          data.meshmode,
          true,
          req.params.id,
          req.params.org,
        ]
      )
      .then((result) => {
        nats_proxy.register_device(
          result.rows[0].devicemac,
          req.params.org,
          result.rows[0].nkey
        );
      });
    await client.query(`COMMIT`);
    res.status(200).send({ message: "Device registered successfuly" });
  } catch (e) {
    await client.query(`ROLLBACK`);
    if (!res.statusCode) {
      res.status(500).send({ errorMessage: e.message });
    }
  } finally {
    client.release();
  }
};

const deleteFromDb = (req, res) => {
  const { id, org } = req.params;
  db.query(
    `DELETE FROM devices WHERE deviceId=$1 AND orgId = $2 RETURNING deviceMac`,
    [id, org]
  ).then((data) => {
    nats_proxy.delete_device(data.rows[0].devicemac);
    res.status(200).send({ message: "Device deleted successfuly" });
  });
};

exports.delete = async (req, res) => {
  const { org } = req.params;
  try {
    const { resetConfig, deviceMac } = req.body;
    if (resetConfig) {
      const subj = `v1.organization.${org}.device.${deviceMac.toUpperCase()}.config`;
      [await publish_json(subj, { reset_config: {} }), deleteFromDb(req, res)];
    } else if (deviceMac) {
      const subj = `v1.organization.${org}.device.${deviceMac.toUpperCase()}.bye`;
      [await publish_json(subj, { bye: {} }), deleteFromDb(req, res)];
    } else {
      deleteFromDb(req, res);
    }
  } catch (err) {
    res.status(500).send({ errorMessage: err.message });
  }
};
