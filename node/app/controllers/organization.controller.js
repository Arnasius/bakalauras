const db = require("../db");
const nats_proxy = require("../nats/config_proxy");
const { validateData, formSingleUpdateQuery } = require("../services/utils");

exports.add = async (req, res) => {
  let { orgname, description } = req.body;
  const client = await db.getClient();
  if (!orgname) {
    res.status(400).send({
      message: "The organization name can't be empty, please enter a value.",
    });
  }
  try {
    client.query(`BEGIN`);
    const data = await client.query(
      `
        INSERT INTO organizations (orgname, description, createddate, updateddate)
        VALUES ($1, $2, now(), now()) RETURNING orgid
        `,
      [orgname, description]
    );
    await nats_proxy.add_organization(data.rows[0].orgid, false);

    const organizations = await client.query(
      `
      SELECT orgid FROM organizations
      `
    );
    await nats_proxy.import_topics(organizations.rows);
    res.status(200).send({ message: "Organization added successfully!" });
    await client.query(`COMMIT`);
  } catch (err) {
    await client.query(`ROLLBACK`);
    if (
      err.message ===
      'duplicate key value violates unique constraint "organizations_orgname_key"'
    ) {
      res
        .status(400)
        .send({ message: "Failed! Organization name is already in use!" });
    } else {
      res.status(500).send({ message: err.message });
    }
  } finally {
    client.release();
  }
};

exports.delete = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query(`BEGIN`);
    await client.query(
      `
      DELETE FROM organizations WHERE orgid=$1 RETURNING orgname
        `,
      [req.params.org]
    );

    await nats_proxy.delete_organization(req.params.org, false);
    const organizations = await client.query(
      `
      SELECT orgid FROM organizations
      `
    );
    await nats_proxy.import_topics(organizations.rows);

    res.status(200).send({ message: "Organization deleted successfully!" });
    await client.query(`COMMIT`);
  } catch (err) {
    await client.query(`ROLLBACK`);
    res.status(500).send({ message: err.message });
  } finally {
    client.release();
  }
};

exports.update = (req, res) => {
  req.body = { ...req.body, orgid: parseInt(req.params.org) };
  const validKeyNames = ["orgid", "orgname", "description"];

  if (!validateData(req.body, validKeyNames)) {
    res.status(400).send({ message: "Data was rejected. Please try again." });
    return;
  }

  const query = formSingleUpdateQuery(req.body, "organizations", "orgid");

  db.query(query[0], query[1])
    .then(() => {
      res.status(200).send({ message: "Update successful!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAll = async (req, res) => {
  if (req.isSuperAdmin) {
    await db
      .query(
        `
        SELECT orgid, orgname, description, createddate, updatedDate
        FROM organizations
      `
      )
      .then((result) => {
        res.status(200).send(result.rows);
        return;
      });
  } else {
    await db
      .query(
        `
        SELECT organizations.orgid, organizations.orgname, organizations.description, organizations.createddate, organizations.updatedDate, userorganizations.roleid
        FROM organizations
        JOIN userorganizations
        ON organizations.orgid = userorganizations.orgid
        WHERE userid = $1 AND userorganizations.status = 'accepted'
      `,
        [req.userId]
      )
      .then((result) => {
        res.status(200).send(result.rows);
        return;
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.get = async (req, res) => {
  if (req.isSuperAdmin) {
    await db
      .query(
        `
        SELECT orgid, orgname, description
        FROM organizations
        WHERE orgid = $1
      `,
        [req.params.org]
      )
      .then((result) => {
        res.status(200).send(result.rows[0]);
        return;
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } else {
    await db
      .query(
        `
      SELECT organizations.orgid, organizations.orgname, organizations.description, userorganizations.roleid
      FROM organizations
      LEFT JOIN userorganizations
      ON organizations.orgid = userorganizations.orgid
      WHERE userorganizations.userid = $1 AND organizations.orgid = $2
    `,
        [req.userId, req.params.org]
      )
      .then((result) => {
        res.status(200).send(result.rows[0]);
        return;
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};
