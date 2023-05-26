const db = require("../db");
const { validateData } = require("../services/utils");

exports.get = async (req, res) => {
  const { id, org } = req.params;

  if (id) {
    await db
      .query(
        "SELECT groupname, description, config, configseq FROM groups WHERE groupId = $1 AND orgId = $2",
        [id, org],
        (err, result) => {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.status(200).send(result.rows[0]);
        }
      )
      .then((result) => res.status(200).send(result.rows[0]))
      .catch((err) => res.status(500).send({ message: err.message }));
  } else {
    await db
      .query(
        `
        SELECT groupname, description, groupId,
        (SELECT COUNT(deviceName) FROM devices WHERE groupId=groups.groupId AND orgId=$1)
        as deviceCount,
        (SELECT SUM(deviceinfo.clientcount)
        FROM devices 
        INNER JOIN deviceinfo 
        ON devices.deviceid = deviceinfo.deviceid 
        WHERE devices.groupid = groups.groupid AND orgId = $1 AND devices.heartbeat > now() - INTERVAL '5 minutes') AS ClientCount,
        (SELECT count(deviceid) FROM devices WHERE heartbeat > now() - INTERVAL '5 minutes' AND groupid = groups.groupid AND orgid = $1)
        AS up, 
        (SELECT count(deviceid) FROM devices WHERE (heartbeat <= now() - INTERVAL '5 minutes' OR heartbeat IS NULL) AND groupid = groups.groupid AND orgid = $1)
        AS down
        FROM groups WHERE orgId = $1
        `,
        [org]
      )
      .then((result) => res.status(200).send(result.rows))
      .catch((err) => res.status(500).send({ message: err.message }));
  }
};

exports.add = (req, res) => {
  const { id, org } = req.params;

  if (id) {
    const validKeyNames = ["groupname", "description", "config"];
    const data = req.body;
    if (!validateData(data, validKeyNames)) {
      res.status(400).send({ message: "Data was rejected. Please try again." });
      return;
    }

    db.query(
      `UPDATE groups SET (groupname, description, config) = ($1, $2, $3) WHERE groupId=$4 AND orgId=$5`,
      [...Object.values(data), id, org]
    )
      .then(() => {
        res.status(200).send({ message: "Update successful!" });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } else {
    let { groupname, description, config } = req.body;
    if (!groupname || !description || !config) {
      res.status(500).send({ message: "Enter all fields" });
      return;
    }

    db.query(
      `
          INSERT INTO groups (groupname, description, orgId, config, createdDate, updatedDate)
          VALUES ($1, $2, $3, $4, now(), now()) RETURNING groupId
        `,
      [groupname, description, org, config]
    )
      .then(() => {
        res.status(200).send({ message: "Group added successfully!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.delete = (req, res) => {
  const { id, org } = req.params;

  db.query(
    `
        DELETE FROM groups WHERE groupId=$1 AND orgId=$2
      `,
    [id, org]
  )
    .then(() => {
      res.status(200).send({ message: "Group deleted successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
