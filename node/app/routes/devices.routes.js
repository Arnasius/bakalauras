const { authJwt } = require("../middleware");
const organizationRoles = require("../middleware/organizationRoles");
const controller = require("../controllers/devices");
const trimObject = require("../middleware/trim");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/organizations/:org/groups/:groupId/devices",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.get
  );
  app.get(
    "/api/organizations/:org/groups/:groupId/devices/:id",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.get
  );
  app.get(
    "/api/organizations/:org/groups/:groupId/devices/:deviceId/info",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getStats
  );
  app.get(
    "/api/organizations/:org/devices",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getOrganizationDevices
  );
  app.get(
    "/api/organizations/:org/devices/unregistered",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getUnregistered
  );
  app.get(
    "/api/organizations/:org/devices/unregistered/:id",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getUnregistered
  );
  app.get(
    "/api/organizations/:org/device/:mac/:interval/:data",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.getGraphData
  );

  app.post(
    "/api/organizations/:org/groups/:groupId/devices",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    trimObject.trim,
    controller.add
  );
  app.post(
    "/api/organizations/:org/groups/:groupId/devices/:id",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    trimObject.trim,
    controller.add
  );
  app.post(
    "/api/organizations/:org/devices/unregistered/:id",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    trimObject.trim,
    controller.addUnregistered
  );
  app.post(
    "/api/organizations/:org/groups/:groupId/devices/:deviceId/reboot",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    controller.reboot
  );
  app.post(
    "/api/organizations/:org/groups/:groupId/devices/:deviceId/upgrade",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    controller.upgrade
  );
  app.delete(
    "/api/organizations/:org/devices/:id",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    controller.delete
  );
};
