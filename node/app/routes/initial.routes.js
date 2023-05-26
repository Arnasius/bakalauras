const controller = require("../controllers/initial.controller");
const trimObject = require("../middleware/trim");

module.exports = function (app) {
  app.get("/api/initial", controller.get);
  app.post("/api/initial", trimObject.trim, controller.save);
};
