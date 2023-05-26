const { authJwt } = require("../middleware");
const organizationRoles = require("../middleware/organizationRoles");
const controller = require("../controllers/organization.controller");
const trimObject = require("../middleware/trim");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/organizations/", authJwt.verifyToken, controller.getAll);
  app.get(
    "/api/organizations/:org",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.get
  );
  app.post(
    "/api/organizations",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    trimObject.trim,
    controller.add
  );
  app.post(
    "/api/organizations/:org",
    authJwt.verifyToken,
    organizationRoles.isAdmin,
    trimObject.trim,
    controller.update
  );
  app.delete(
    "/api/organizations/:org",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    controller.delete
  );
};
