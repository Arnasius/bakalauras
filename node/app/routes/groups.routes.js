const { authJwt } = require("../middleware");
const organizationRoles = require("../middleware/organizationRoles");
const controller = require("../controllers/groups");
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
    "localhost:3000/api/organizations/:org/groups",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.get
  );
  app.get(
    "/api/organizations/:org/groups/:id",
    authJwt.verifyToken,
    organizationRoles.isViewer,
    controller.get
  );
  app.post(
    "/api/organizations/:org/groups",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    trimObject.trim,
    controller.add
  );
  app.delete(
    "/api/organizations/:org/groups/:id",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    controller.delete
  );
  app.post(
    "/api/organizations/:org/groups/:id",
    authJwt.verifyToken,
    organizationRoles.isEditor,
    trimObject.trim,
    controller.add
  );
};
