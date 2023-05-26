const config = require("../config/auth.config");
const db = require("../db");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signinWithToken = (req, res) => {
  db.query(
    `
    SELECT username, issuperadmin
    FROM users
    WHERE users.userid=$1
    `,
    [req.userId]
  )
    .then((result) => {
      res.status(200).send({
        id: req.userId,
        username: result.rows[0].username,
        isSuperAdmin: result.rows[0].issuperadmin,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  let { username, password } = req.body;

  db.query(
    `
    SELECT users.userid, users.username, users.password, issuperadmin
    FROM users
    WHERE username=$1
    `,
    [username]
  )
    .then((result) => {
      const tableData = result.rows[0];

      if (!tableData || !tableData.username) {
        return res
          .status(401)
          .send({ message: "Invalid username or password" });
      }

      var passwordIsValid = bcrypt.compareSync(password, tableData.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid username or password",
        });
      }

      var serverToken = jwt.sign(
        { id: tableData.userid, isSuperAdmin: tableData.issuperadmin },
        config.serverSecret,
        {
          expiresIn: config.expiresIn,
        }
      );
      res.cookie("serverToken", serverToken, {
        httpOnly: true,
        maxAge: config.expiresIn * 1000,
      });

      var clientToken = jwt.sign({}, config.clientSecret, {
        expiresIn: config.expiresIn,
      });

      res.cookie("clientToken", clientToken, {
        httpOnly: false,
        maxAge: config.expiresIn * 1000,
      });

      db.query("UPDATE users SET lastlogindate=now() WHERE username=$1", [
        username,
      ]);

      res.status(200).send({
        id: tableData.userid,
        username: tableData.username,
        isSuperAdmin: result.rows[0].issuperadmin,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.logout = (req, res) => {
  return res
    .clearCookie("serverToken")
    .clearCookie("clientToken")
    .status(200)
    .json({ message: "Successfully logged out" });
};
