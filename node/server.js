const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { cacheInit } = require("./app/services/node-cache");
const { migrate } = require("./app/migrations");
const { initialConfig } = require("./app/nats/initial-config");
const { node_nkeys, subscriber_nkeys } = require("./app/nkeys/nkeys");

app.use(cookieParser());

app.use(cors({ origin: true }));

// parse requests of content-type - application/json
app.use(express.json({ limit: "50mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Node backend is running." });
});

require("./app/ws.js")(server);

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  next();
});

cacheInit(function (err) {
  if (err) console.error(err);
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/initial.routes")(app);
require("./app/routes/organization.routes")(app);
require("./app/routes/groups.routes")(app);
require("./app/routes/devices.routes")(app);
require("./app/routes/server.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;

node_nkeys();
subscriber_nkeys();

migrate()
  .then(() => {
    initialConfig();
  })
  .then(() => {
    server.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}.`);
    });
  })
  .catch((e) => {
    console.error(e);
    console.error("Database migration failed. Exiting.");
    process.exit(1);
  });
