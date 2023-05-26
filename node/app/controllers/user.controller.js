const db = require("../db");
var bcrypt = require("bcryptjs");
const {
  validateData,
  formSingleUpdateQuery,
  copyDeep,
  expand,
  flatten,
} = require("../services/utils");
const emails = require("../smtp/emails");

function roleIdIsValid(roleid, res) {
  if (roleid < 1 || 3 < roleid) {
    res.status(400).send({
      message: "Selected role id does not exist. Role id: " + roleid.toString(),
    });
    return false;
  }
  return true;
}

exports.add = (req, res) => {
  let {
    username,
    email,
    password,
    password2,
    firstname,
    lastname,
    country,
    roleid,
    userOrganizations,
  } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    !password2 ||
    !firstname ||
    !lastname ||
    !country
  ) {
    res.status(400).send({ message: "Enter all fields" });
    return;
  }
  const data = copyDeep(req.body);
  if (!roleIdIsValid(roleid, res)) return;
  if (password !== password2) {
    res.status(400).send({ message: "Passwords didn't match" });
    return;
  } else if (password) {
    password = bcrypt.hashSync(data.password, 8);
  }
  db.query(
    `
      INSERT INTO users (username, password, firstname, lastname, country, email, issuperadmin, createddate, updateddate)
      VALUES ($1, $2, $3, $4, $5, $6, false, now(), now()) 
      RETURNING userid`,
    [username, password, firstname, lastname, country, email]
  )
    .then((data) => {
      if (userOrganizations) {
        let values = [];
        userOrganizations.map((value) => {
          values.push([
            data.rows[0].userid,
            value.orgid,
            value.roleid,
            "now()",
            "accepted",
          ]);
        });
        db.query(
          `
          INSERT INTO userOrganizations (userid, orgid, roleid, createddate, status)
          VALUES ${expand(values.length, 5)};
        `,
          flatten(values)
        );
      }
    })
    .then(() => {
      res.status(200).send({ message: "User registered successfully!" });
    })
    .catch((err) => {
      if (
        err.message ===
        'duplicate key value violates unique constraint "users_username_key"'
      ) {
        res
          .status(400)
          .send({ message: "Failed! Username is already in use!" });
      } else if (
        err.message ===
        'duplicate key value violates unique constraint "users_email_key"'
      ) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

exports.delete = (req, res) => {
  if (req.body.userid === 1) {
    res.status(400).send({ message: "Failed! Cannot remove this user!" });
    return;
  }
  db.query(
    `
      DELETE FROM users WHERE userid=$1 RETURNING userid
    `,
    [req.body.userid]
  )
    .then((result) => {
      if (result.rows.length > 0)
        res.status(200).send({ message: "User deleted successfully!" });
      else
        res
          .status(400)
          .send({ message: `User with id: ${req.body.userid} does not exist` });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.update = async (req, res) => {
  const validKeyNames = [
    "username",
    "firstname",
    "lastname",
    "country",
    "email",
    "password",
    "password2",
    "userid",
    "userOrganizations",
  ];
  const data = copyDeep(req.body);
  data.userid = req.params.id;

  if (!validateData(data, validKeyNames)) {
    res.status(400).send({ message: "Data was rejected. Please try again." });
    return;
  }

  if (!roleIdIsValid(data.roleid, res)) return;

  if (data.password !== data.password2) {
    res.status(400).send({ message: "Passwords didn't match" });
    return;
  } else if (data.password) {
    delete data.password2;
    data.password = bcrypt.hashSync(data.password, 8);
  }

  if (data.userOrganizations) {
    let values = [];

    data.userOrganizations.map((value) => {
      values.push([
        req.params.id,
        value.orgid,
        value.roleid,
        "now()",
        "accepted",
      ]);
    });

    const client = await db.getClient();
    try {
      await client.query(`BEGIN`);

      await client.query(
        `
          DELETE FROM userorganizations WHERE userid = $1;
          `,
        [data.userid]
      );

      if (data.userOrganizations.length) {
        await client.query(
          `
              INSERT INTO userOrganizations (userid, orgid, roleid, createddate, status)
              VALUES ${expand(values.length, 5)};
            `,
          flatten(values)
        );
      }

      await client.query(`COMMIT`);
    } catch (e) {
      res.status(500).send({ errorMessage: e.message });

      await client.query(`ROLLBACK`);
    } finally {
      client.release();
    }

    delete data.userOrganizations;
  }

  const query = formSingleUpdateQuery(data, "users", "userid");
  // update database
  db.query(query[0], query[1])
    .then(() => {
      res.status(200).send({ message: "Update successful!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAllUsers = (req, res) => {
  db.query(
    `
  SELECT users.userid, users.username, users.firstname, users.lastlogindate,
  users.lastname, users.email,
  users.createddate, users.updateddate, users.country
  FROM users
  `
  )
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAllPendingInvites = (req, res) => {
  db.query(
    `
    SELECT users.userid, users.email, userOrganizations.orgid, userOrganizations.status, userOrganizations.key
    FROM userOrganizations
    LEFT JOIN users ON userOrganizations.userid = users.userid
    WHERE userOrganizations.status = 'pending'
  `
  )
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUser = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT users.userid, users.username, users.firstname, users.lastlogindate,
    users.lastname, users.email, userOrganizations.roleId,
    users.createddate, users.updateddate, users.country, userOrganizations.orgId
    FROM users
    LEFT JOIN userOrganizations ON users.userid=userOrganizations.userid
    WHERE users.userid=$1
    `,
    [id]
  )
    .then((result) => {
      let userOrganizations = [];

      result.rows.map((row) => {
        if (row.orgid && row.roleid)
          userOrganizations.push({
            orgid: row.orgid,
            roleid: row.roleid,
          });
      });
      delete result.rows[0].roleid;
      delete result.rows[0].orgid;
      res.status(200).send({ ...result.rows[0], userOrganizations });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getOrgUsers = (req, res) => {
  const { org } = req.params;

  db.query(
    `
  SELECT users.userid, users.username, users.firstname, users.lastlogindate,
  users.lastname, users.email, userOrganizations.roleid, userOrganizations.status,
  userOrganizations.key,
  users.createddate, users.updateddate, users.country, userOrganizations.orgId
  FROM organizations
  JOIN userOrganizations ON organizations.orgId=userOrganizations.orgId
  JOIN users ON userorganizations.userId=users.userId
  WHERE organizations.orgid=$1
  `,
    [org]
  )
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getOrgUser = (req, res) => {
  const { org, id } = req.params;

  db.query(
    `
  SELECT users.userid, users.username, users.firstname, users.lastlogindate,
  users.lastname, users.email, userOrganizations.roleid,
  users.createddate, users.updateddate, users.country, userOrganizations.orgId
  FROM organizations
  LEFT JOIN userOrganizations ON organizations.orgId=userOrganizations.orgId
  LEFT JOIN users ON userorganizations.userId=users.userId
  WHERE organizations.orgid=$1 AND users.userid = $2
  `,
    [org, id]
  ).then((result) => {
    let userOrganizations = [];
    if (typeof result.rows[0] === "undefined") {
      res.status(400).send({
        message: "Failed! User is not found in the specified organization!",
      });
    } else {
      userOrganizations.push({
        orgid: result.rows[0].orgid,
        roleid: result.rows[0].roleid,
      });
      delete result.rows[0].roleid;
      delete result.rows[0].orgid;
      res.status(200).send({ ...result.rows[0], userOrganizations });
    }
  });
};

exports.removeUserFromOrg = async (req, res) => {
  const { org, id } = req.params;

  const client = await db.getClient();

  try {
    await client.query(`BEGIN`);
    const result = await client.query(
      `
      SELECT userOrganizations.orgid, users.email, users.username FROM users
      INNER JOIN userOrganizations ON users.userId=userOrganizations.userId
      WHERE users.userid = $1
      `,
      [id]
    );
    if (!result.rows.length) {
      res.status(400).send({
        message: "Failed! This user does not exist in the organization!",
      });
      throw new Error();
    }

    await client.query(
      `
      DELETE FROM userOrganizations WHERE orgId = $1 AND userId = $2
      `,
      [org, id]
    );
    await client.query(`COMMIT`);
    res
      .status(200)
      .send({ message: "User removed from organization successfuly" });
  } catch (e) {
    await client.query(`ROLLBACK`);
    if (!res.statusCode) {
      res.status(500).send({ errorMessage: e.message });
    }
  } finally {
    client.release();
  }
};

exports.updateUser = (req, res) => {
  const validKeyNames = [
    "username",
    "firstname",
    "lastname",
    "country",
    "email",
    "password",
    "password2",
  ];

  const data = copyDeep(req.body);

  if (!validateData(data, validKeyNames)) {
    res.status(400).send({ message: "Data was rejected. Please try again." });
    return;
  }
  data.userid = req.userId;

  if (data.password !== data.password2) {
    res.status(400).send({ message: "Passwords didn't match" });
    return;
  } else if (data.password) {
    delete data.password2;
    data.password = bcrypt.hashSync(data.password, 8);
  }

  const query = formSingleUpdateQuery(data, "users", "userid");
  // update database
  db.query(query[0], query[1])
    .then(() => {
      res.status(200).send({ message: "Update successful!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.changeRole = async (req, res) => {
  const { id, org } = req.params;
  try {
    await db.query(
      `
      UPDATE userorganizations SET roleid = $1 WHERE userid = $2 AND orgId = $3
      `,
      [req.body.roleid, id, org]
    );
    await res.status(200).send({ message: "Role has been changed!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

exports.accept = async (req, res) => {
  const { id, org } = req.params;
  try {
    await db.query(
      `
      UPDATE userorganizations SET status = $1 WHERE userid = $2 AND orgId = $3
      `,
      ["accepted", id, org]
    );
    await res.status(200).send({ message: "Invitation has been accepted!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

exports.decline = async (req, res) => {
  const { id, org } = req.params;
  try {
    await db.query(
      `
      UPDATE userorganizations SET status = $1 WHERE userid = $2 AND orgId = $3
      `,
      ["declined", id, org]
    );
    await res.status(200).send({ message: "Invitation has been declined!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

exports.inviteUser = async (req, res) => {
  const { org } = req.params;
  const { roleid, email } = req.body;

  var rand = function () {
    return Math.random().toString(36).substr(2);
  };
  const key = rand() + rand();

  const client = await db.getClient();
  try {
    await client.query(`BEGIN`);

    const orgResult = await client.query(
      `
      SELECT users.email, userorganizations.orgid FROM users
      LEFT JOIN userOrganizations ON users.userid=userOrganizations.userid
      WHERE users.email=$1 AND userOrganizations.orgid=$2
      `,
      [email, org]
    );

    const emailResult = await client.query(
      `
      SELECT email, userid FROM users WHERE email=$1
    `,
      [email]
    );

    let user_state = null;
    if (!emailResult.rows.length && !orgResult.rows.length) user_state = "new";
    else if (emailResult.rows.length && !orgResult.rows.length)
      user_state = "existing";

    if (user_state == "new") {
      await client.query(
        `
      with rows as (
      INSERT INTO users (email, isSuperAdmin) VALUES ($1, false) RETURNING userid
      )
      INSERT INTO userOrganizations (userid, orgid, roleid, createddate, status, key)
      SELECT rows.userid, $2, $3, now(), $4, $5
      FROM rows
      `,
        [email, org, roleid, "pending", key]
      );
    } else if (user_state == "existing") {
      await client.query(
        `
        INSERT INTO userOrganizations (userid, orgid, roleid, createddate, status)
        VALUES ($1, $2, $3, now(), $4)
        `,
        [emailResult.rows[0].userid, org, roleid, "pending"]
      );
    } else {
      await client.query(`COMMIT`);
      res.status(400).send({
        message:
          "Failed! User has already been invited to join this organization!",
      });
      return;
    }
    await client.query(`COMMIT`);

    if (user_state == "new") emails.new_user_invite(email, org, key);
    else if (user_state == "existing")
      emails.existing_user_invite(email, org, roleid);

    res.status(200).send({ message: "User invited successfully!" });
  } catch (e) {
    await client.query(`ROLLBACK`);
    if (!res.statusCode) {
      res.status(500).send({ message: e.message });
    }
  } finally {
    client.release();
  }
};

exports.checkInvite = async (req, res) => {
  const { key } = req.params;

  db.query(
    `
    SELECT users.email from userOrganizations
    INNER JOIN users ON users.userid = userOrganizations.userid
    WHERE key = $1
    `,
    [key]
  )
    .then((result) => {
      if (!result.rows.length) {
        res.status(400).send({ message: "Invitation link is not found" });
        return;
      }
      res.status(200).send({ email: result.rows[0].email });
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

exports.acceptNewInvitation = async (req, res) => {
  const { email, username, firstname, lastname, country, password, password2 } =
    req.body;

  if (
    !username ||
    !email ||
    !password ||
    !password2 ||
    !firstname ||
    !lastname ||
    !country
  ) {
    res.status(400).send({ message: "Enter all fields" });
    return;
  }
  if (password !== password2) {
    res.status(400).send({ message: "Passwords didn't match" });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 8);

  const client = await db.getClient();
  try {
    await client.query(`BEGIN`);

    const result = await db.query(
      `
      UPDATE users SET username = $1, firstname = $2, lastname = $3, country = $4, password = $5,
      createddate = now(), updateddate = now()
      WHERE email = $6
      RETURNING userid
      `,
      [username, firstname, lastname, country, hashedPassword, email]
    );
    await client.query(
      `
      UPDATE userOrganizations SET key = null, status = $1 WHERE userid = $2
      `,
      ["accepted", result.rows[0].userid]
    );
    await client.query(`COMMIT`);
    await res.status(200).send({ message: "Success" });
  } catch (e) {
    await client.query(`ROLLBACK`);
    if (!res.statusCode) {
      res.status(500).send({ errorMessage: e.message });
    }
  } finally {
    client.release();
  }
};

exports.checkPendingInvites = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
    SELECT userOrganizations.status, organizations.orgname, userOrganizations.orgid
    FROM UserOrganizations
    INNER JOIN organizations ON userorganizations.orgid = organizations.orgid
    WHERE userid = $1 AND userOrganizations.status = 'pending'
    `,
      [id]
    );

    await res.status(200).send({ data: result.rows });
  } catch (e) {
    res.status(500).send({ errorMessage: e.message });
  }
};

exports.deleteInvite = async (req, res) => {
  const { id } = req.params;
  const { org, email } = req.body;
  const client = await db.getClient();

  try {
    await client.query(`BEGIN`);

    const userResult = await client.query(
      `
      SELECT username FROM users WHERE email=$1
      `,
      [email]
    );

    if (userResult.rows[0].username === null) {
      await client.query(
        `
          DELETE FROM users WHERE email=$1
          `,
        [email]
      );

      await client.query(
        `
            DELETE FROM userOrganizations WHERE userid = $1 AND orgid = $2
            `,
        [id, org]
      );
    } else {
      await client.query(
        `
        DELETE FROM userorganizations 
        WHERE userid = $1 AND orgid = $2
        `,
        [id, org]
      );
    }
    await client.query(`COMMIT`);
    res.status(200).send({ message: "Invite deleted successfully!" });
  } catch (e) {
    await client.query(`ROLLBACK`);
    res.status(500).send({ errorMessage: e.message });
  } finally {
    client.release();
  }
};

exports.resetLink = async (req, res) => {
  const { email } = req.body;

  var rand = function () {
    return Math.random().toString(36).substr(2);
  };
  const key = rand() + rand();

  const client = await db.getClient();

  try {
    await client.query(`BEGIN`);

    const emailResult = await client.query(
      `
      SELECT email FROM users WHERE email = $1
      `,
      [email]
    );

    if (emailResult.rows.length) {
      await client.query(
        `
        UPDATE users SET resetKey = $1 WHERE email = $2
        `,
        [key, email]
      );
      await client.query(`COMMIT`);
      emails.password_reset(email, key);
      res.status(200).send({ message: "Password reset link has been sent!" });
    } else {
      await client.query(`COMMIT`);
      res.status(400).send({ message: "This email does not exist!" });
    }
  } catch (e) {
    await client.query(`ROLLBACK`);
    if (!res.statusCode) {
      res.status(500).send({ errorMessage: e.message });
    }
  } finally {
    client.release();
  }
};

exports.checkReset = async (req, res) => {
  const { key } = req.params;
  try {
    const result = await db.query(
      `
    SELECT resetKey from users WHERE resetKey = $1
    `,
      [key]
    );
    if (!result.rows.length) {
      res.status(400).send({ message: "Reset link is not found" });
    } else {
      res.status(200).send(result.rows[0]);
    }
  } catch (e) {
    if (!res.statusCode) {
      res.status(500).send({ error: e.message });
    }
  }
};

exports.updatePassword = async (req, res) => {
  const { password, password2 } = req.body;
  const { key } = req.params;
  if (password !== password2) {
    res.status(400).send({ message: "Passwords didn't match" });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    await db.query(
      `
      UPDATE users SET password = $1, updatedDate = now(), resetKey = $2 WHERE resetKey = $3
      `,
      [hashedPassword, null, key]
    );
    res
      .status(200)
      .send({ message: "Password has been changed successfully!" });
  } catch (e) {
    if (!res.statusCode) {
      res.status(500).send({ ErrorMessage: e.message });
    }
  }
};
