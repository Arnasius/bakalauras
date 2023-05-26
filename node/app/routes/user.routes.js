const { authJwt } = require("../middleware");
const organizationRoles = require("../middleware/organizationRoles");
const userOrgMiddleware = require("../middleware/userOrgMiddleware");
const controller = require("../controllers/user.controller");
const trimObject = require("../middleware/trim");

module.exports = function (app) {
  app.post(
    "/api/users",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    trimObject.trim,
    controller.add
  );
  app.get(
    "/api/users/pending",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    controller.getAllPendingInvites
  );
  app.delete(
    "/api/users/:id",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    userOrgMiddleware.invalidateCache,
    controller.delete
  );
  app.post(
    "/api/users/:id",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    userOrgMiddleware.invalidateCache,
    trimObject.trim,
    controller.update
  );

  app.get(
    "/api/users",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    controller.getAllUsers
  );

  app.get(
    "/api/users/:id",
    authJwt.verifyToken,
    organizationRoles.isPersonal,
    controller.getUser
  );

  app.get(
    "/api/organizations/:org/users",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getOrgUsers
  );

  app.get(
    "/api/organizations/:org/users/:id",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    controller.getOrgUser
  );

  app.post(
    "/api/organizations/:org/users",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    trimObject.trim,
    controller.inviteUser
  );

  app.post(
    "/api/organizations/:org/users/:id",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    trimObject.trim,
    controller.changeRole
  );

  app.delete(
    "/api/organizations/:org/users/:id",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    userOrgMiddleware.invalidateCache,
    controller.removeUserFromOrg
  );

  app.get(
    "/api/organizations/:org/users/:id/accept",
    authJwt.verifyToken,
    controller.accept
  );

  app.get(
    "/api/organizations/:org/users/:id/decline",
    authJwt.verifyToken,
    controller.decline
  );

  app.get(
    "/api/users/:id/pending",
    authJwt.verifyToken,
    controller.checkPendingInvites
  );

  app.delete(
    "/api/organizations/:org/users/:id/invite",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    controller.deleteInvite
  );
  app.post("/api/user/reset", controller.resetLink);

  app.get("/api/user/reset/:key", controller.checkReset);

  app.post("/api/user/reset/:key", controller.updatePassword);

  app.get("/api/user/register/:key", controller.checkInvite);

  app.post("/api/user/register", controller.acceptNewInvitation);

  app.post(
    "/api/user",
    authJwt.verifyToken,
    trimObject.trim,
    controller.updateUser
  );
};
