const { authJwt } = require("../middleware");
const organizationRoles = require("../middleware/organizationRoles");
const controller = require("../controllers/server.controller");
const multer = require("multer");
const config = require("../config/path.config");
const upload = multer({ dest: config.firmwares });
const trimObject = require("../middleware/trim");

module.exports = function (app) {
  app.get("/api/server", authJwt.verifyToken, controller.getServerInfo);
  app.post(
    "/api/server",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    trimObject.trim,
    controller.updateServerInfo
  );
  app.post(
    "/api/server/certs",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    controller.upload
  );
  app.post(
    "/api/server/firmwares",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    upload.single("file"),
    controller.uploadFirmware
  );
  app.get(
    "/api/server/firmwares",
    authJwt.verifyToken,
    controller.getFirmwares
  );
  app.delete(
    "/api/server/firmwares/:id/:filename",
    authJwt.verifyToken,
    organizationRoles.isSuperAdmin,
    controller.deleteFirmware
  );
  app.get("/api/server/smtp", controller.checkSmtp);
};
