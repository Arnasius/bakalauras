const db = require("../db");
const { cacheInstance } = require("../services/node-cache");
const util = require("util");

const isSuperAdmin = (req, res, next) => {
  if (req.isSuperAdmin) next();
  else {
    res.status(403).send({
      message: "Super Admin role is required!",
    });
    return;
  }
};

const isPersonal = (req, res, next) => {
  if (req.isSuperAdmin) next();
  else if (req.userId === parseInt(req.params.id)) next();
  else {
    res.status(403).send({
      message: "Super Admin role is required!",
    });
    return;
  }
};

const isAdmin = (req, res, next) => {
  if (req.isSuperAdmin) next();
  else
    getUserRoleFromDb(req)
      .then(() => {
        if (req.roleId == 1) next();
        else {
          res.status(403).send({
            message:
              "Admin role is required or the selected organization is not available for this user!",
          });
          return;
        }
      })
      .catch(() =>
        res.status(401).send({
          message: "Unauthorized!",
        })
      );
};

const isEditor = (req, res, next) => {
  if (req.isSuperAdmin) next();
  else
    getUserRoleFromDb(req)
      .then(() => {
        if (req.roleId <= 2) next();
        else {
          res.status(403).send({
            message:
              "Editor role is required or the selected organization is not available for this user!",
          });
          return;
        }
      })
      .catch(() =>
        res.status(401).send({
          message: "Unauthorized!",
        })
      );
};

const isViewer = async (req, res, next) => {
  if (req.isSuperAdmin) next();
  else
    getUserRoleFromDb(req)
      .then(() => {
        if (req.roleId <= 3) next();
        else {
          res.status(403).send({
            message:
              "Viewer role is required or the selected organization is not available for this user!",
          });
          return;
        }
      })
      .catch(() =>
        res.status(401).send({
          message: "Unauthorized!",
        })
      );
};

async function getUserRoleFromDb(req) {
  const cache_id = util.format("%s_%s", req.userId, req.params.org);
  const cacheValue = cacheInstance().get(cache_id);

  if (cacheValue !== undefined) {
    req.roleId = cacheValue.roleId;
    return;
  }

  await db
    .query(
      `
      SELECT roleid
      FROM userorganizations
      WHERE userorganizations.userid=$1 AND userorganizations.orgid=$2
`,
      [req.userId, req.params.org]
    )
    .then((result) => {
      const cacheObj = { roleId: result.rows[0].roleid };
      cacheInstance().set(cache_id, cacheObj);
      req.roleId = result.rows[0].roleid;
    });
}

const organizationRoles = {
  isSuperAdmin: isSuperAdmin,
  isAdmin: isAdmin,
  isEditor: isEditor,
  isViewer: isViewer,
  isPersonal: isPersonal,
};
module.exports = organizationRoles;
