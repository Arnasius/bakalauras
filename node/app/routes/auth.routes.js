const { authJwt, initialSetup } = require("../middleware");
const controller = require("../controllers/auth");

module.exports = function (app) {
  app.post("/api/auth/signin", controller.signin);
  app.get(
    "/api/auth/signin",
    initialSetup.isInitialState,
    authJwt.verifyToken,
    controller.signinWithToken
  );
  app.get("/api/auth/logout", authJwt.verifyToken, controller.logout);
};
