const config = require("../config/path.config");
const db = require("../db");
var bcrypt = require("bcryptjs");
const nats_proxy = require("../nats/config_proxy");
const { cacheInstance } = require("../services/node-cache");

async function loadState() {
  const { rows } = await db.query(
    "SELECT initialsetup FROM serverinfo WHERE serverid = $1",
    [config.serverId]
  );
  return rows[0].initialsetup;
}

function setState(state) {
  cacheInstance().set("state", state);
}

async function getState() {
  let state = cacheInstance().get("state");
  if (state !== undefined) {
    return state;
  }
  state = await loadState();
  setState(state);

  return state;
}

exports.save = async (req, res) => {
  // Save User to Database
  const {
    username,
    email,
    password,
    password2,
    name,
    firstname,
    lastname,
    country,
    domain,
  } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    !password2 ||
    !firstname ||
    !lastname ||
    !country ||
    !name ||
    !domain
  ) {
    res.status(500).send({ message: "Enter all fields" });
  }

  if (password !== password2) {
    res.status(500).send({ message: "Passwords did't match" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const now = new Date().toUTCString();
  const client = await db.getClient();

  try {
    await client.query(`BEGIN`);

    const mainResult = await client.query(
      `
    WITH
    rows as (
      INSERT INTO users (username, password, email, firstname, lastname, country, issuperadmin, createddate, updateddate)
      VALUES ($1, $2, $3, $6, $7, $8, true, $4, $4)
    ),
    organizations as (
      INSERT INTO organizations (orgname, createddate, updateddate)
      VALUES ($5, $4, $4) RETURNING orgid
    )
    UPDATE serverinfo SET initialsetup = false, domain = $10 WHERE serverid = $9
    `,
      [
        username,
        hashedPassword,
        email,
        now,
        name,
        firstname,
        lastname,
        country,
        config.serverId,
        domain,
      ]
    );

    if (!mainResult.rows.length) {
      setState(false);
      const orgResult = await client.query(
        `SELECT orgid FROM organizations WHERE orgname=$1`,
        [name]
      );
      if (orgResult.rows.length) {
        await nats_proxy.add_organization(orgResult.rows[0].orgid, false);
        const organizations = await client.query(
          `
          SELECT orgid FROM organizations
          `
        );
        await nats_proxy.import_topics(organizations.rows);
      }
    }

    await client.query(`COMMIT`);

    res.status(200).send({ message: "Organization setup finished" });
  } catch (err) {
    await client.query(`ROLLBACK`);
    if (
      err.message ===
      'duplicate key value violates unique constraint "users_username_key"'
    ) {
      res.status(400).send({ message: "Failed! Username is already in use!" });
    } else if (
      err.message ===
      'duplicate key value violates unique constraint "users_email_key"'
    ) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
    } else {
      res.status(500).send({ message: err.message });
    }
  } finally {
    client.release();
  }
};

exports.get = async (req, res) => {
  res.status(200).send({ initial: await getState() });
};

exports.initial = getState;
